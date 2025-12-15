const UserManagementService = require('../services/UserManagementService');

class UserManagementController {
  async promoteTrustedMember(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const result = await UserManagementService.promoteTrustedMember(req.user, email);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async demoteTrustedMember(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const result = await UserManagementService.demoteTrustedMember(req.user, email);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await UserManagementService.getAllUsers(req.user);

      res.status(200).json({
        success: true,
        users
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPermissions(req, res, next) {
    try {
      const permissions = await UserManagementService.getUserPermissions(req.user.id);

      res.status(200).json({
        success: true,
        permissions
      });
    } catch (error) {
      next(error);
    }
  }

  async initializeTrustedMembers(req, res, next) {
    try {
      await UserManagementService.initializeTrustedMembers();

      res.status(200).json({
        success: true,
        message: 'Trusted members initialized successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserManagementController();