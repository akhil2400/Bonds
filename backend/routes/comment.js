const express = require('express');
const CommentController = require('../controllers/CommentController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', CommentController.createComment);
router.get('/my', CommentController.getUserComments);
router.get('/:parentType/:parentId', CommentController.getCommentsByParent);
router.get('/:id', CommentController.getComment);
router.put('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

module.exports = router;