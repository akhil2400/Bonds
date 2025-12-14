const CommentService = require('../services/CommentService');

class CommentController {
  async createComment(req, res, next) {
    try {
      const userId = req.user.id;
      const commentData = req.body;

      const comment = await CommentService.createComment(userId, commentData);

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        comment
      });
    } catch (error) {
      next(error);
    }
  }

  async getComment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const comment = await CommentService.getCommentById(id, userId);

      res.status(200).json({
        success: true,
        comment
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommentsByParent(req, res, next) {
    try {
      const { parentType, parentId } = req.params;
      const userId = req.user.id;

      const comments = await CommentService.getCommentsByParent(parentType, parentId, userId);

      res.status(200).json({
        success: true,
        count: comments.length,
        comments
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserComments(req, res, next) {
    try {
      const userId = req.user.id;

      const comments = await CommentService.getUserComments(userId);

      res.status(200).json({
        success: true,
        count: comments.length,
        comments
      });
    } catch (error) {
      next(error);
    }
  }
  async updateComment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const comment = await CommentService.updateComment(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        comment
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await CommentService.deleteComment(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();