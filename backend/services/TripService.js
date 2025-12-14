const TripRepository = require('../repositories/TripRepository');
const CustomError = require('../errors/CustomError');

class TripService {
  async createTrip(userId, tripData) {
    const { destination, description, budget, startDate, endDate, planDetails, tips, media, isPublic } = tripData;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      throw new CustomError('End date must be after start date', 400);
    }

    const trip = await TripRepository.create({
      destination,
      description,
      budget,
      startDate: start,
      endDate: end,
      planDetails,
      tips,
      media: media || [],
      owner: userId,
      isPublic: isPublic || false
    });

    return trip;
  }

  async getTripById(tripId, userId = null) {
    const trip = await TripRepository.findById(tripId);
    
    if (!trip) {
      throw new CustomError('Trip not found', 404);
    }

    // Check if user can access this trip
    if (!trip.isPublic && (!userId || trip.owner._id.toString() !== userId)) {
      throw new CustomError('Access denied', 403);
    }

    return trip;
  }

  async getUserTrips(userId) {
    return await TripRepository.findByOwner(userId);
  }

  async getPublicTrips() {
    return await TripRepository.findPublic();
  }
  async getAllTrips(userId) {
    // Return public trips and user's own trips
    const filter = {
      $or: [
        { isPublic: true },
        { owner: userId }
      ]
    };
    
    return await TripRepository.findAll(filter);
  }

  async updateTrip(tripId, userId, updateData) {
    const trip = await TripRepository.findById(tripId);
    
    if (!trip) {
      throw new CustomError('Trip not found', 404);
    }

    // Validate ownership
    if (trip.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only update your own trips', 403);
    }

    // Validate dates if being updated
    if (updateData.startDate || updateData.endDate) {
      const start = new Date(updateData.startDate || trip.startDate);
      const end = new Date(updateData.endDate || trip.endDate);
      
      if (end <= start) {
        throw new CustomError('End date must be after start date', 400);
      }
    }

    const updatedTrip = await TripRepository.update(tripId, updateData);
    return updatedTrip;
  }

  async deleteTrip(tripId, userId) {
    const trip = await TripRepository.findById(tripId);
    
    if (!trip) {
      throw new CustomError('Trip not found', 404);
    }

    // Validate ownership
    if (trip.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only delete your own trips', 403);
    }

    await TripRepository.delete(tripId);
    return { message: 'Trip deleted successfully' };
  }
}

module.exports = new TripService();