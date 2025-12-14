const TimelineRepository = require('../repositories/TimelineRepository');
const CustomError = require('../errors/CustomError');

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

  async getTimelineById(timelineId, userId) {
    const timeline = await TimelineRepository.findById(timelineId);
    
    if (!timeline) {
      throw new CustomError('Timeline not found', 404);
    }

    // Check if user can access this timeline
    if (timeline.isPrivate && timeline.owner._id.toString() !== userId) {
      throw new CustomError('Access denied', 403);
    }

    return timeline;
  }

  async getUserTimelines(userId) {
    return await TimelineRepository.findByOwner(userId);
  }

  async getAllTimelines(userId) {
    // Return public timelines and user's own timelines
    const filter = {
      $or: [
        { isPrivate: false },
        { owner: userId }
      ]
    };
    
    return await TimelineRepository.findAll(filter);
  }
  async updateTimeline(timelineId, userId, updateData) {
    const timeline = await TimelineRepository.findById(timelineId);
    
    if (!timeline) {
      throw new CustomError('Timeline not found', 404);
    }

    // Validate ownership
    if (timeline.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only update your own timelines', 403);
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

  async deleteTimeline(timelineId, userId) {
    const timeline = await TimelineRepository.findById(timelineId);
    
    if (!timeline) {
      throw new CustomError('Timeline not found', 404);
    }

    // Validate ownership
    if (timeline.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only delete your own timelines', 403);
    }

    await TimelineRepository.delete(timelineId);
    return { message: 'Timeline deleted successfully' };
  }
}

module.exports = new TimelineService();