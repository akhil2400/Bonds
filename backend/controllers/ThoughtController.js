const ThoughtService = require('../services/ThoughtService');

class ThoughtController {
  async createThought(req, res, next) {
    try {
      const userId = req.user.id;
      const thoughtData = req.body;

      const thought = await ThoughtService.createThought(userId, thoughtData);

      res.status(201).json({
        success: true,
        message: 'Thought created successfully',
        thought
      });
    } catch (error) {
      next(error);
    }
  }

  async getThought(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const thought = await ThoughtService.getThoughtById(id, userId);

      res.status(200).json({
        success: true,
        thought
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserThoughts(req, res, next) {
    try {
      const userId = req.user.id;

      const thoughts = await ThoughtService.getUserThoughts(userId);

      res.status(200).json({
        success: true,
        count: thoughts.length,
        thoughts
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllThoughts(req, res, next) {
    try {
      const userId = req.user.id;

      const thoughts = await ThoughtService.getAllThoughts(userId);

      res.status(200).json({
        success: true,
        count: thoughts.length,
        thoughts
      });
    } catch (error) {
      next(error);
    }
  }

  async updateThought(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const thought = await ThoughtService.updateThought(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Thought updated successfully',
        thought
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteThought(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await ThoughtService.deleteThought(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ThoughtController();