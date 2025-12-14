const CommentRepository = require('../repositories/CommentRepository');
const MemoryRepository = require('../repositories/MemoryRepository');
const ThoughtRepository = require('../repositories/ThoughtRepository');
const TripRepository = require('../repositories/TripRepository');
const MusicRepository = require('../repositories/MusicRepository');
const CustomError = require('../errors/CustomError');

class CommentService {
  async createComment(userId, commentData) {
    const { content, parentType, parentId } = commentData;

    // Validate parent exists and user has access
    await this.validateParentAccess(parentType, parentId, userId);

    const comment = await CommentRepository.create({
      content,
      owner: userId,
      parentType,
      parentId
    });

    return comment;
  }

  async getCommentById(commentId, userId) {
    const comment = await CommentRepository.findById(commentId);
    
    if (!comment) {
      throw new CustomError('Comment not found', 404);
    }

    // Validate user has access to the parent resource
    await this.validateParentAccess(comment.parentType, comment.parentId, userId);

    return comment;
  }

  async getCommentsByParent(parentType, parentId, userId) {
    // Validate parent exists and user has access
    await this.validateParentAccess(parentType, parentId, userId);

    return await CommentRepository.findByParent(parentType, parentId);
  }

  async getUserComments(userId) {
    return await CommentRepository.findByOwner(userId);
  }
  async updateComment(commentId, userId, updateData) {
    const comment = await CommentRepository.findById(commentId);
    
    if (!comment) {
      throw new CustomError('Comment not found', 404);
    }

    // Validate ownership
    if (comment.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only update your own comments', 403);
    }

    const updatedComment = await CommentRepository.update(commentId, updateData);
    return updatedComment;
  }

  async deleteComment(commentId, userId) {
    const comment = await CommentRepository.findById(commentId);
    
    if (!comment) {
      throw new CustomError('Comment not found', 404);
    }

    // Validate ownership
    if (comment.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only delete your own comments', 403);
    }

    await CommentRepository.delete(commentId);
    return { message: 'Comment deleted successfully' };
  }

  async validateParentAccess(parentType, parentId, userId) {
    let parent;
    
    switch (parentType) {
      case 'Memory':
        parent = await MemoryRepository.findById(parentId);
        break;
      case 'Thought':
        parent = await ThoughtRepository.findById(parentId);
        break;
      case 'Trip':
        parent = await TripRepository.findById(parentId);
        break;
      case 'Music':
        parent = await MusicRepository.findById(parentId);
        break;
      default:
        throw new CustomError('Invalid parent type', 400);
    }

    if (!parent) {
      throw new CustomError(`${parentType} not found`, 404);
    }

    // Check if user can access the parent resource
    if (parentType === 'Trip') {
      // For trips, check if it's public or owned by user
      if (!parent.isPublic && parent.owner._id.toString() !== userId) {
        throw new CustomError('Access denied to parent resource', 403);
      }
    } else {
      // For other resources, check if it's not private or owned by user
      if (parent.isPrivate && parent.owner._id.toString() !== userId) {
        throw new CustomError('Access denied to parent resource', 403);
      }
    }

    return parent;
  }
}

module.exports = new CommentService();