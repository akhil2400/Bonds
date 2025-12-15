const TripRepository = require('../repositories/TripRepository');
const CustomError = require('../errors/CustomError');
const { isTrustedMember } = require('../middlewares/authorization');

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

  async getTripById(tripId, user = null) {
    const trip = await TripRepository.findById(tripId);
    
    if (!trip) {
      throw new CustomError('Trip not found', 404);
    }

    // Trusted members can access all trips (public + private from any trusted member)
    // Viewers can only access public trips
    if (!trip.isPublic) {
      if (!user || !isTrustedMember(user)) {
        throw new CustomError('Access denied', 403);
      }
    }

    return trip;
  }

  async getUserTrips(userId) {
    return await TripRepository.findByOwner(userId);
  }

  async getPublicTrips() {
    return await TripRepository.findPublic();
  }
  async getAllTrips(user) {
    // Trusted members can see all trips (public + private from any trusted member)
    // Viewers can only see public trips
    if (isTrustedMember(user)) {
      // Trusted members see everything
      return await TripRepository.findAll({});
    } else {
      // Viewers only see public trips
      return await TripRepository.findAll({ isPublic: true });
    }
  }

  async updateTrip(tripId, user, updateData) {
    const trip = await TripRepository.findById(tripId);
    
    if (!trip) {
      throw new CustomError('Trip not found', 404);
    }

    // Only trusted members can update trips (shared ownership model)
    if (!isTrustedMember(user)) {
      throw new CustomError('Access denied. Only trusted members can update trips', 403);
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

  async deleteTrip(tripId, user) {
    const trip = await TripRepository.findById(tripId);
    
    if (!trip) {
      throw new CustomError('Trip not found', 404);
    }

    // Only trusted members can delete trips (shared ownership model)
    if (!isTrustedMember(user)) {
      throw new CustomError('Access denied. Only trusted members can delete trips', 403);
    }

    await TripRepository.delete(tripId);
    return { message: 'Trip deleted successfully' };
  }
}

module.exports = new TripService();