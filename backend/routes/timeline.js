const express = require('express');
const TimelineController = require('../controllers/TimelineController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', TimelineController.createTimeline);
router.get('/', TimelineController.getAllTimelines);
router.get('/my', TimelineController.getUserTimelines);
router.get('/:id', TimelineController.getTimeline);
router.put('/:id', TimelineController.updateTimeline);
router.delete('/:id', TimelineController.deleteTimeline);

module.exports = router;