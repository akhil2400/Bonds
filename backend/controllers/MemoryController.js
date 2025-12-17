const MemoryService = require('../services/MemoryService');
const { uploadMultipleImages, uploadMultipleMedia, deleteMultipleImages, deleteMultipleMedia } = require('../config/cloudinary');
const { cleanupFiles } = require('../middlewares/upload');

class MemoryController {
  async createMemory(req, res, next) {
    try {
      const userId = req.user.id;
      const memoryData = req.body;
      const files = req.files;

      // Convert isPrivate string to boolean
      if (memoryData.isPrivate !== undefined) {
        memoryData.isPrivate = memoryData.isPrivate === 'true';
      }

      // Upload media (images and videos) to Cloudinary if files are provided
      let uploadedMedia = [];
      if (files && files.length > 0) {
        const imageFiles = files.filter(file => file.mimetype.startsWith('image/'));
        const videoFiles = files.filter(file => file.mimetype.startsWith('video/'));
        
        console.log(`📸 Uploading ${imageFiles.length} images and ${videoFiles.length} videos to Cloudinary...`);
        
        try {
          uploadedMedia = await uploadMultipleMedia(files, 'bonds/memories');
          console.log('✅ Media uploaded successfully:', uploadedMedia.map(media => `${media.resourceType}: ${media.url}`));
          // Clean up temporary files
          cleanupFiles(files);
        } catch (uploadError) {
          console.error('❌ Media upload failed:', uploadError);
          // Clean up temporary files on error
          cleanupFiles(files);
          throw uploadError;
        }
      }

      // Add uploaded media to memory data
      memoryData.media = uploadedMedia;
      console.log('💾 Creating memory with media:', memoryData.media.length, 'files');

      const memory = await MemoryService.createMemory(userId, memoryData);

      res.status(201).json({
        success: true,
        message: 'Memory created successfully',
        memory
      });
    } catch (error) {
      // Clean up any uploaded media on error
      if (req.uploadedMedia && req.uploadedMedia.length > 0) {
        deleteMultipleMedia(req.uploadedMedia).catch(console.error);
      }
      next(error);
    }
  }

  async getMemory(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const memory = await MemoryService.getMemoryById(id, userId, req.user);

      res.status(200).json({
        success: true,
        memory
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserMemories(req, res, next) {
    try {
      const userId = req.user.id;

      const memories = await MemoryService.getUserMemories(userId);

      res.status(200).json({
        success: true,
        count: memories.length,
        memories
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllMemories(req, res, next) {
    try {
      const userId = req.user.id;

      const memories = await MemoryService.getAllMemories(userId, req.user);
      
      console.log(`📋 Fetched ${memories.length} memories for user ${req.user.email}`);
      if (memories.length > 0) {
        console.log('🖼️  Sample memory media:', memories[0].media);
      }

      res.status(200).json({
        success: true,
        count: memories.length,
        memories
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemory(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const memory = await MemoryService.updateMemory(id, userId, updateData, req.user);

      res.status(200).json({
        success: true,
        message: 'Memory updated successfully',
        memory
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMemory(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await MemoryService.deleteMemory(id, userId, req.user);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // New endpoint for uploading media (images and videos)
  async uploadMedia(req, res, next) {
    try {
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No media files provided'
        });
      }

      try {
        const uploadedMedia = await uploadMultipleMedia(files, 'bonds/memories');
        // Clean up temporary files
        cleanupFiles(files);

        res.status(200).json({
          success: true,
          message: 'Media uploaded successfully',
          media: uploadedMedia
        });
      } catch (uploadError) {
        // Clean up temporary files on error
        cleanupFiles(files);
        throw uploadError;
      }
    } catch (error) {
      next(error);
    }
  }

  // Backward compatibility - keep the old uploadImages method
  async uploadImages(req, res, next) {
    try {
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No images provided'
        });
      }

      try {
        const uploadedImages = await uploadMultipleImages(files, 'bonds/memories');
        // Clean up temporary files
        cleanupFiles(files);

        res.status(200).json({
          success: true,
          message: 'Images uploaded successfully',
          images: uploadedImages
        });
      } catch (uploadError) {
        // Clean up temporary files on error
        cleanupFiles(files);
        throw uploadError;
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MemoryController();