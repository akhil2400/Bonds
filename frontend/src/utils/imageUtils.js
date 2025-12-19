// Utility functions for image processing and debugging

export const debugImageFile = (file, label = 'Image') => {
  console.log(`${label} Debug Info:`, {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    lastModified: new Date(file.lastModified).toISOString()
  });
};

export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          url: e.target.result,
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Supported types: ${validTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 50MB`);
  }
  
  return true;
};

export const validateVideoFile = (file) => {
  const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error(`Invalid video type: ${file.type}. Supported types: ${validTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`Video too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 100MB`);
  }
  
  return true;
};

export const createSafeObjectURL = (file) => {
  try {
    if (!file) {
      console.error('❌ Cannot create URL: file is null or undefined');
      return null;
    }
    
    if (!(file instanceof File) && !(file instanceof Blob)) {
      console.error('❌ Cannot create URL: not a File or Blob object', typeof file);
      return null;
    }
    
    if (file.size === 0) {
      console.error('❌ Cannot create URL: file is empty (0 bytes)');
      return null;
    }
    
    const url = URL.createObjectURL(file);
    console.log('✅ Created object URL:', url, 'for file:', {
      name: file.name || 'unnamed',
      size: file.size,
      type: file.type
    });
    return url;
  } catch (error) {
    console.error('❌ Failed to create object URL:', error);
    return null;
  }
};

export const revokeSafeObjectURL = (url) => {
  try {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      console.log('Revoked object URL:', url);
    }
  } catch (error) {
    console.error('Failed to revoke object URL:', error);
  }
};

export const cropImageToCanvas = async (imageElement, crop) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!crop || !crop.width || !crop.height) {
    throw new Error('Invalid crop parameters');
  }

  // Calculate crop dimensions
  let cropX, cropY, cropWidth, cropHeight;
  
  if (crop.unit === '%') {
    cropX = (crop.x / 100) * imageElement.naturalWidth;
    cropY = (crop.y / 100) * imageElement.naturalHeight;
    cropWidth = (crop.width / 100) * imageElement.naturalWidth;
    cropHeight = (crop.height / 100) * imageElement.naturalHeight;
  } else {
    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;
    cropX = crop.x * scaleX;
    cropY = crop.y * scaleY;
    cropWidth = crop.width * scaleX;
    cropHeight = crop.height * scaleY;
  }

  // Ensure crop is within bounds
  cropX = Math.max(0, Math.min(cropX, imageElement.naturalWidth));
  cropY = Math.max(0, Math.min(cropY, imageElement.naturalHeight));
  cropWidth = Math.min(cropWidth, imageElement.naturalWidth - cropX);
  cropHeight = Math.min(cropHeight, imageElement.naturalHeight - cropY);

  // Set canvas size
  canvas.width = Math.round(cropWidth);
  canvas.height = Math.round(cropHeight);

  // Configure context for high quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw cropped image
  ctx.drawImage(
    imageElement,
    Math.round(cropX),
    Math.round(cropY),
    Math.round(cropWidth),
    Math.round(cropHeight),
    0,
    0,
    Math.round(cropWidth),
    Math.round(cropHeight)
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create cropped image blob'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.95
    );
  });
};