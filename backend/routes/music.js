const express = require('express');
const MusicController = require('../controllers/MusicController');
const auth = require('../middlewares/auth');
const { allowOnlyTrustedMembers, allowAuthenticatedUsers } = require('../middlewares/authorization');

const router = express.Router();

// All routes require authentication
router.use(auth);

// CREATE, UPDATE, DELETE - Only trusted members
router.post('/', allowOnlyTrustedMembers, MusicController.createMusic);
router.put('/:id', allowOnlyTrustedMembers, MusicController.updateMusic);
router.delete('/:id', allowOnlyTrustedMembers, MusicController.deleteMusic);

// READ - All authenticated users
router.get('/', allowAuthenticatedUsers, MusicController.getAllMusic);
router.get('/my', allowAuthenticatedUsers, MusicController.getUserMusic);
router.get('/:id', allowAuthenticatedUsers, MusicController.getMusic);

module.exports = router;