const express = require('express');
const UserManagementController = require('../controllers/UserManagementController');
const auth = require('../middlewares/auth');
const { allowOnlyAdmin } = require('../middlewares/authorization');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Admin-only routes
router.post('/promote', allowOnlyAdmin, UserManagementController.promoteTrustedMember);
router.post('/demote', allowOnlyAdmin, UserManagementController.demoteTrustedMember);
router.get('/users', allowOnlyAdmin, UserManagementController.getAllUsers);
router.post('/initialize', allowOnlyAdmin, UserManagementController.initializeTrustedMembers);

// User permissions (available to all authenticated users)
router.get('/permissions', UserManagementController.getUserPermissions);

module.exports = router;