const express = require('express');
const ThoughtController = require('../controllers/ThoughtController');
const auth = require('../middlewares/auth');
const { allowOnlyTrustedMembers, allowAuthenticatedUsers } = require('../middlewares/authorization');

const router = express.Router();

// All routes require authentication
router.use(auth);

// CREATE, UPDATE, DELETE - Only trusted members
router.post('/', allowOnlyTrustedMembers, ThoughtController.createThought);
router.put('/:id', allowOnlyTrustedMembers, ThoughtController.updateThought);
router.delete('/:id', allowOnlyTrustedMembers, ThoughtController.deleteThought);

// READ - All authenticated users
router.get('/', allowAuthenticatedUsers, ThoughtController.getAllThoughts);
router.get('/my', allowAuthenticatedUsers, ThoughtController.getUserThoughts);
router.get('/:id', allowAuthenticatedUsers, ThoughtController.getThought);

module.exports = router;