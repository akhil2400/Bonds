const express = require('express');
const CommentController = require('../controllers/CommentController');
const auth = require('../middlewares/auth');
const { allowOnlyTrustedMembers, allowAuthenticatedUsers } = require('../middlewares/authorization');

const router = express.Router();

// All routes require authentication
router.use(auth);

// CREATE, UPDATE, DELETE - Only trusted members
router.post('/', allowOnlyTrustedMembers, CommentController.createComment);
router.put('/:id', allowOnlyTrustedMembers, CommentController.updateComment);
router.delete('/:id', allowOnlyTrustedMembers, CommentController.deleteComment);

// READ - All authenticated users
router.get('/my', allowAuthenticatedUsers, CommentController.getUserComments);
router.get('/:parentType/:parentId', allowAuthenticatedUsers, CommentController.getCommentsByParent);
router.get('/:id', allowAuthenticatedUsers, CommentController.getComment);

module.exports = router;