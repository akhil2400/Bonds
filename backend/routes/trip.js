const express = require('express');
const TripController = require('../controllers/TripController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const { allowOnlyTrustedMembers, allowAuthenticatedUsers } = require('../middlewares/authorization');

const router = express.Router();

// Public routes (no authentication required) - REMOVED for private friendship site
// router.get('/public', TripController.getPublicTrips);

// Single trip view with optional auth (for sharing links)
router.get('/:id', optionalAuth, TripController.getTrip);

// Protected routes (authentication required)
router.use(auth);

// CREATE, UPDATE, DELETE - Only trusted members
router.post('/', allowOnlyTrustedMembers, TripController.createTrip);
router.put('/:id', allowOnlyTrustedMembers, TripController.updateTrip);
router.delete('/:id', allowOnlyTrustedMembers, TripController.deleteTrip);

// READ - All authenticated users
router.get('/', allowAuthenticatedUsers, TripController.getAllTrips);
router.get('/my', allowAuthenticatedUsers, TripController.getUserTrips);

module.exports = router;