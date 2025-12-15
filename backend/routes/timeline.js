const express = require('express');
const TimelineController = require('../controllers/TimelineController');
const auth = require('../middlewares/auth');
const { allowOnlyTrustedMembers, allowAuthenticatedUsers } = require('../middlewares/authorization');

const router = express.Router();

// All routes require authentication
router.use(auth);

// CREATE, UPDATE, DELETE - Only trusted members
router.post('/', allowOnlyTrustedMembers, TimelineController.createTimeline);
router.put('/:id', allowOnlyTrustedMembers, TimelineController.updateTimeline);
router.delete('/:id', allowOnlyTrustedMembers, TimelineController.deleteTimeline);

// READ - All authenticated users
router.get('/', allowAuthenticatedUsers, TimelineController.getAllTimelines);
router.get('/my', allowAuthenticatedUsers, TimelineController.getUserTimelines);
router.get('/:id', allowAuthenticatedUsers, TimelineController.getTimeline);

module.exports = router;