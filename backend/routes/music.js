const express = require('express');
const MusicController = require('../controllers/MusicController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', MusicController.createMusic);
router.get('/', MusicController.getAllMusic);
router.get('/my', MusicController.getUserMusic);
router.get('/:id', MusicController.getMusic);
router.put('/:id', MusicController.updateMusic);
router.delete('/:id', MusicController.deleteMusic);

module.exports = router;