const express = require('express');
const MemoryController = require('../controllers/MemoryController');
const auth = require('../middlewares/auth');
const { allowOnlyTrustedMembers, allowAuthenticatedUsers } = require('../middlewares/authorization');
const { uploadMultiple, uploadMultipleMedia } = require('../middlewares/upload');

const router = express.Router();

// All routes require authentication
router.use(auth);

// CREATE, UPDATE, DELETE - Only trusted members
router.post('/', allowOnlyTrustedMembers, uploadMultipleMedia, MemoryController.createMemory);
router.put('/:id', allowOnlyTrustedMembers, MemoryController.updateMemory);
router.delete('/:id', allowOnlyTrustedMembers, MemoryController.deleteMemory);

// Media upload endpoints
router.post('/upload-media', allowOnlyTrustedMembers, uploadMultipleMedia, MemoryController.uploadMedia);
router.post('/upload-images', allowOnlyTrustedMembers, uploadMultiple, MemoryController.uploadImages); // Backward compatibility

// READ - All authenticated users
router.get('/', allowAuthenticatedUsers, MemoryController.getAllMemories);
router.get('/my', allowAuthenticatedUsers, MemoryController.getUserMemories);
router.get('/:id', allowAuthenticatedUsers, MemoryController.getMemory);

module.exports = router;