const TimelineRepository = require('../repositories/TimelineRepository');
const CustomError = require('../errors/CustomError');
const { isTrustedMember, TRUSTED_MEMBER_EMAILS } = require('../middlewares/authorization');

class TimelineService {
  async createTimeline(userId, timelineData) {
    const { year, title, description, media, isPrivate } = timelineData;

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      throw new CustomError('Year cannot be in the future', 400);
    }

    const timeline = await TimelineRepository.create({
      year,
      title,
      description,
      media: media || [],
      owner: userId,
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    return timeline;
  }

  async getTimelineById(timelineId, userId, user) {
    const timeline = await TimelineRepository.findById(timelineId);
    
    if (!timeline) {
      throw new CustomError('Timeline not found', 404);
    }

    // Check if user can access this timeline
    const userIsTrusted = isTrustedMember(user);
    const ownerIsTrusted = TRUSTED_MEMBER_EMAILS.includes(timeline.owner.email?.toLowerCase());
    
    if (timeline.isPrivate) {
      if (timeline.owner._id.toString() === userId) {
        return timeline;
      } else if (userIsTrusted && ownerIsTrusted) {
        return timeline;
      } else {
        throw new CustomError('Access denied', 403);
      }
    }

    return timeline;
  }

  async getUserTimelines(userId) {
    return await TimelineRepository.findByOwner(userId);
  }

  async getAllTimelines(userId, user) {
    const userIsTrusted = isTrustedMember(user);
    
    if (userIsTrusted) {
      // Trusted members see ALL timelines from trusted members + public timelines from everyone
      const trustedMemberIds = await this.getTrustedMemberIds();
      
      const filter = {
        $or: [
          { isPrivate: false }, // All public timelines
          { owner: { $in: trustedMemberIds } } // All timelines from trusted members
        ]
      };
      
      return await TimelineRepository.findAll(filter);
    } else {
      // Regular viewers only see public timelines
      const filter = { isPrivate: false };
      return await TimelineRepository.findAll(filter);
    }
  }

  async getTrustedMemberIds() {
    const User = require('../models/User');
    const trustedUsers = await User.find({ 
      email: { $in: TRUSTED_MEMBER_EMAILS.map(email => email.toLowerCase()) }
    }).select('_id');
    
    return trustedUsers.map(user => user._id);
  }
  async updateTimeline(timelineId, userId, updateData, user) {
    const timeline = await TimelineRepository.findById(timelineId);
    
    if (!timeline) {
      throw new CustomError('Timeline not found', 404);
    }

    const userIsTrusted = isTrustedMember(user);
    const ownerIsTrusted = TRUSTED_MEMBER_EMAILS.includes(timeline.owner.email?.toLowerCase());

    // Validate access - trusted members can edit any trusted member's content
    if (timeline.owner._id.toString() !== userId) {
      if (!(userIsTrusted && ownerIsTrusted)) {
        throw new CustomError('Access denied. You can only update timelines from trusted members', 403);
      }
    }

    // Validate year if being updated
    if (updateData.year) {
      const currentYear = new Date().getFullYear();
      if (updateData.year > currentYear) {
        throw new CustomError('Year cannot be in the future', 400);
      }
    }

    const updatedTimeline = await TimelineRepository.update(timelineId, updateData);
    return updatedTimeline;
  }

  async deleteTimeline(timelineId, userId, user) {
    const timeline = await TimelineRepository.findById(timelineId);
    
    if (!timeline) {
      throw new CustomError('Timeline not found', 404);
    }

    const userIsTrusted = isTrustedMember(user);
    const ownerIsTrusted = TRUSTED_MEMBER_EMAILS.includes(timeline.owner.email?.toLowerCase());

    // Validate access - trusted members can delete any trusted member's content
    if (timeline.owner._id.toString() !== userId) {
      if (!(userIsTrusted && ownerIsTrusted)) {
        throw new CustomError('Access denied. You can only delete timelines from trusted members', 403);
      }
    }

    await TimelineRepository.delete(timelineId);
    return { message: 'Timeline deleted successfully' };
  }
}

module.exports = new TimelineService();