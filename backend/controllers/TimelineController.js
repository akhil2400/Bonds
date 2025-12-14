const TimelineService = require('../services/TimelineService');

class TimelineController {
  async createTimeline(req, res, next) {
    try {
      const userId = req.user.id;
      const timelineData = req.body;

      const timeline = await TimelineService.createTimeline(userId, timelineData);

      res.status(201).json({
        success: true,
        message: 'Timeline created successfully',
        timeline
      });
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const timeline = await TimelineService.getTimelineById(id, userId);

      res.status(200).json({
        success: true,
        timeline
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserTimelines(req, res, next) {
    try {
      const userId = req.user.id;

      const timelines = await TimelineService.getUserTimelines(userId);

      res.status(200).json({
        success: true,
        count: timelines.length,
        timelines
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllTimelines(req, res, next) {
    try {
      const userId = req.user.id;

      const timelines = await TimelineService.getAllTimelines(userId);

      res.status(200).json({
        success: true,
        count: timelines.length,
        timelines
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const timeline = await TimelineService.updateTimeline(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Timeline updated successfully',
        timeline
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await TimelineService.deleteTimeline(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TimelineController();