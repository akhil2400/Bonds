const express = require('express');
const TripController = require('../controllers/TripController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', TripController.getPublicTrips);
router.get('/:id', optionalAuth, TripController.getTrip);

// Protected routes (authentication required)
router.use(auth);

router.post('/', TripController.createTrip);
router.get('/', TripController.getAllTrips);
router.get('/my', TripController.getUserTrips);
router.put('/:id', TripController.updateTrip);
router.delete('/:id', TripController.deleteTrip);

module.exports = router;