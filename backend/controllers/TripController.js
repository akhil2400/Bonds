const TripService = require('../services/TripService');

class TripController {
  async createTrip(req, res, next) {
    try {
      const userId = req.user.id;
      const tripData = req.body;

      const trip = await TripService.createTrip(userId, tripData);

      res.status(201).json({
        success: true,
        message: 'Trip created successfully',
        trip
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrip(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user || null;

      const trip = await TripService.getTripById(id, user);

      res.status(200).json({
        success: true,
        trip
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserTrips(req, res, next) {
    try {
      const userId = req.user.id;

      const trips = await TripService.getUserTrips(userId);

      res.status(200).json({
        success: true,
        count: trips.length,
        trips
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicTrips(req, res, next) {
    try {
      const trips = await TripService.getPublicTrips();

      res.status(200).json({
        success: true,
        count: trips.length,
        trips
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllTrips(req, res, next) {
    try {
      const user = req.user;

      const trips = await TripService.getAllTrips(user);

      res.status(200).json({
        success: true,
        count: trips.length,
        trips
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTrip(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const updateData = req.body;

      const trip = await TripService.updateTrip(id, user, updateData);

      res.status(200).json({
        success: true,
        message: 'Trip updated successfully',
        trip
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTrip(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const result = await TripService.deleteTrip(id, user);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TripController();