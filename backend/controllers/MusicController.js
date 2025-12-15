const MusicService = require('../services/MusicService');

class MusicController {
  async createMusic(req, res, next) {
    try {
      const userId = req.user.id;
      const musicData = req.body;

      const music = await MusicService.createMusic(userId, musicData);

      res.status(201).json({
        success: true,
        message: 'Music created successfully',
        music
      });
    } catch (error) {
      next(error);
    }
  }

  async getMusic(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const music = await MusicService.getMusicById(id, user);

      res.status(200).json({
        success: true,
        music
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserMusic(req, res, next) {
    try {
      const userId = req.user.id;

      const music = await MusicService.getUserMusic(userId);

      res.status(200).json({
        success: true,
        count: music.length,
        music
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllMusic(req, res, next) {
    try {
      const user = req.user;

      const music = await MusicService.getAllMusic(user);

      res.status(200).json({
        success: true,
        count: music.length,
        music
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMusic(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const updateData = req.body;

      const music = await MusicService.updateMusic(id, user, updateData);

      res.status(200).json({
        success: true,
        message: 'Music updated successfully',
        music
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMusic(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const result = await MusicService.deleteMusic(id, user);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MusicController();