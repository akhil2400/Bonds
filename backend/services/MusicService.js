const MusicRepository = require('../repositories/MusicRepository');
const CustomError = require('../errors/CustomError');

class MusicService {
  async createMusic(userId, musicData) {
    const { title, artist, platform, link, description, isPrivate } = musicData;

    // Validate music link based on platform
    this.validateMusicLink(platform, link);

    const music = await MusicRepository.create({
      title,
      artist,
      platform,
      link,
      description,
      owner: userId,
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    return music;
  }

  async getMusicById(musicId, userId) {
    const music = await MusicRepository.findById(musicId);
    
    if (!music) {
      throw new CustomError('Music not found', 404);
    }

    // Check if user can access this music
    if (music.isPrivate && music.owner._id.toString() !== userId) {
      throw new CustomError('Access denied', 403);
    }

    return music;
  }

  async getUserMusic(userId) {
    return await MusicRepository.findByOwner(userId);
  }

  async getAllMusic(userId) {
    // Return public music and user's own music
    const filter = {
      $or: [
        { isPrivate: false },
        { owner: userId }
      ]
    };
    
    return await MusicRepository.findAll(filter);
  }
  async updateMusic(musicId, userId, updateData) {
    const music = await MusicRepository.findById(musicId);
    
    if (!music) {
      throw new CustomError('Music not found', 404);
    }

    // Validate ownership
    if (music.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only update your own music', 403);
    }

    // Validate link if being updated
    if (updateData.platform && updateData.link) {
      this.validateMusicLink(updateData.platform, updateData.link);
    } else if (updateData.link) {
      this.validateMusicLink(music.platform, updateData.link);
    } else if (updateData.platform) {
      this.validateMusicLink(updateData.platform, music.link);
    }

    const updatedMusic = await MusicRepository.update(musicId, updateData);
    return updatedMusic;
  }

  async deleteMusic(musicId, userId) {
    const music = await MusicRepository.findById(musicId);
    
    if (!music) {
      throw new CustomError('Music not found', 404);
    }

    // Validate ownership
    if (music.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only delete your own music', 403);
    }

    await MusicRepository.delete(musicId);
    return { message: 'Music deleted successfully' };
  }

  validateMusicLink(platform, link) {
    const urlPattern = /^https?:\/\/.+/;
    
    if (!urlPattern.test(link)) {
      throw new CustomError('Invalid URL format', 400);
    }

    switch (platform) {
      case 'Spotify':
        if (!link.includes('spotify.com')) {
          throw new CustomError('Invalid Spotify link', 400);
        }
        break;
      case 'YouTube':
        if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
          throw new CustomError('Invalid YouTube link', 400);
        }
        break;
      case 'Other':
        // Any valid URL is acceptable for 'Other' platform
        break;
      default:
        throw new CustomError('Invalid platform', 400);
    }
  }
}

module.exports = new MusicService();