const MusicRepository = require('../repositories/MusicRepository');
const CustomError = require('../errors/CustomError');
const { isTrustedMember } = require('../middlewares/authorization');

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

  async getMusicById(musicId, user) {
    const music = await MusicRepository.findById(musicId);
    
    if (!music) {
      throw new CustomError('Music not found', 404);
    }

    // Trusted members can access all music (public + private from any trusted member)
    // Viewers can only access public music
    if (music.isPrivate) {
      if (!isTrustedMember(user)) {
        throw new CustomError('Access denied', 403);
      }
    }

    return music;
  }

  async getUserMusic(userId) {
    return await MusicRepository.findByOwner(userId);
  }

  async getAllMusic(user) {
    // Trusted members can see all music (public + private from any trusted member)
    // Viewers can only see public music
    if (isTrustedMember(user)) {
      // Trusted members see everything
      return await MusicRepository.findAll({});
    } else {
      // Viewers only see public music
      return await MusicRepository.findAll({ isPrivate: false });
    }
  }
  async updateMusic(musicId, user, updateData) {
    const music = await MusicRepository.findById(musicId);
    
    if (!music) {
      throw new CustomError('Music not found', 404);
    }

    // Only trusted members can update music (shared ownership model)
    if (!isTrustedMember(user)) {
      throw new CustomError('Access denied. Only trusted members can update music', 403);
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

  async deleteMusic(musicId, user) {
    const music = await MusicRepository.findById(musicId);
    
    if (!music) {
      throw new CustomError('Music not found', 404);
    }

    // Only trusted members can delete music (shared ownership model)
    if (!isTrustedMember(user)) {
      throw new CustomError('Access denied. Only trusted members can delete music', 403);
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