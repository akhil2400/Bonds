// Ensure dotenv is loaded
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  require('dotenv').config();
}

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Cloudinary configured successfully (restart)');

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'bonds') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limit max size
        { quality: 'auto' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format (webp, etc.)
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload video to Cloudinary
const uploadVideo = async (file, folder = 'bonds') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'video',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' }, // Limit max size to 1080p
        { quality: 'auto' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration, // Video duration in seconds
      resourceType: 'video'
    };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

// Upload media file (image or video)
const uploadMedia = async (file, folder = 'bonds') => {
  try {
    const isVideo = file.mimetype.startsWith('video/');
    
    if (isVideo) {
      return await uploadVideo(file, folder);
    } else {
      const result = await uploadImage(file, folder);
      return {
        ...result,
        resourceType: 'image'
      };
    }
  } catch (error) {
    console.error('Media upload error:', error);
    throw new Error(`Failed to upload ${file.mimetype.startsWith('video/') ? 'video' : 'image'}`);
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'bonds') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload images');
  }
};

// Upload multiple media files (images and videos)
const uploadMultipleMedia = async (files, folder = 'bonds') => {
  try {
    const uploadPromises = files.map(file => uploadMedia(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple media upload error:', error);
    throw new Error('Failed to upload media files');
  }
};

// Delete media from Cloudinary (image or video)
const deleteMedia = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete ${resourceType}`);
  }
};

// Delete image from Cloudinary (backward compatibility)
const deleteImage = async (publicId) => {
  return await deleteMedia(publicId, 'image');
};

// Delete multiple media files
const deleteMultipleMedia = async (mediaItems) => {
  try {
    // Group by resource type
    const imageIds = [];
    const videoIds = [];
    
    mediaItems.forEach(item => {
      if (item.resourceType === 'video') {
        videoIds.push(item.publicId);
      } else {
        imageIds.push(item.publicId);
      }
    });
    
    const results = [];
    
    // Delete images
    if (imageIds.length > 0) {
      const imageResult = await cloudinary.api.delete_resources(imageIds, {
        resource_type: 'image'
      });
      results.push(imageResult);
    }
    
    // Delete videos
    if (videoIds.length > 0) {
      const videoResult = await cloudinary.api.delete_resources(videoIds, {
        resource_type: 'video'
      });
      results.push(videoResult);
    }
    
    return results;
  } catch (error) {
    console.error('Multiple media delete error:', error);
    throw new Error('Failed to delete media files');
  }
};

// Delete multiple images (backward compatibility)
const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Multiple delete error:', error);
    throw new Error('Failed to delete images');
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  uploadMedia,
  uploadMultipleImages,
  uploadMultipleMedia,
  deleteImage,
  deleteMedia,
  deleteMultipleImages,
  deleteMultipleMedia
};