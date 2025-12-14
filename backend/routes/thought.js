const express = require('express');
const ThoughtController = require('../controllers/ThoughtController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', ThoughtController.createThought);
router.get('/', ThoughtController.getAllThoughts);
router.get('/my', ThoughtController.getUserThoughts);
router.get('/:id', ThoughtController.getThought);
router.put('/:id', ThoughtController.updateThought);
router.delete('/:id', ThoughtController.deleteThought);

module.exports = router;