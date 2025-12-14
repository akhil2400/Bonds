const express = require('express');
const MemoryController = require('../controllers/MemoryController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', MemoryController.createMemory);
router.get('/', MemoryController.getAllMemories);
router.get('/my', MemoryController.getUserMemories);
router.get('/:id', MemoryController.getMemory);
router.put('/:id', MemoryController.updateMemory);
router.delete('/:id', MemoryController.deleteMemory);

module.exports = router;