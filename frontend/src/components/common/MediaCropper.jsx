import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { cropImageToCanvas } from '../../utils/imageUtils';
import './MediaCropper.css';

const MediaCropper = ({ 
  file, 
  onCropComplete, 
  onCancel, 
  aspectRatio = null, // null for free crop, or number like 16/9, 1, etc.
  progress = null, // { current: 1, total: 3 } for showing progress
  onSkipAll = null // function to skip all remaining files
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  // Store object URL for cleanup
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // Generate canvas for cropped image
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      console.log('Missing required elements for cropping');
      return null;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    // Ensure we have valid crop dimensions
    if (!crop.width || !crop.height) {
      console.log('Invalid crop dimensions');
      return null;
    }

    // Calculate scale factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Calculate actual crop dimensions in pixels
    // Convert percentage-based crop to pixel coordinates
    let cropX, cropY, cropWidth, cropHeight;
    
    if (crop.unit === '%') {
      cropX = (crop.x / 100) * image.naturalWidth;
      cropY = (crop.y / 100) * image.naturalHeight;
      cropWidth = (crop.width / 100) * image.naturalWidth;
      cropHeight = (crop.height / 100) * image.naturalHeight;
    } else {
      // Pixel-based crop
      cropX = crop.x * scaleX;
      cropY = crop.y * scaleY;
      cropWidth = crop.width * scaleX;
      cropHeight = crop.height * scaleY;
    }

    // Ensure crop dimensions are within image bounds
    cropX = Math.max(0, Math.min(cropX, image.naturalWidth));
    cropY = Math.max(0, Math.min(cropY, image.naturalHeight));
    cropWidth = Math.min(cropWidth, image.naturalWidth - cropX);
    cropHeight = Math.min(cropHeight, image.naturalHeight - cropY);

    console.log('Crop calculations:', {
      original: { width: image.naturalWidth, height: image.naturalHeight },
      displayed: { width: image.width, height: image.height },
      crop: { x: cropX, y: cropY, width: cropWidth, height: cropHeight },
      scale: { x: scaleX, y: scaleY }
    });

    // Set canvas size to match crop area
    canvas.width = Math.round(cropWidth);
    canvas.height = Math.round(cropHeight);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      Math.round(cropX),
      Math.round(cropY),
      Math.round(cropWidth),
      Math.round(cropHeight),
      0,
      0,
      Math.round(cropWidth),
      Math.round(cropHeight)
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('❌ Canvas is empty - failed to generate cropped image');
            console.log('Canvas debug info:', {
              width: canvas.width,
              height: canvas.height,
              hasContext: !!ctx
            });
            resolve(null);
            return;
          }
          console.log('✅ Cropped image generated successfully:', {
            size: blob.size,
            type: blob.type,
            canvasSize: { width: canvas.width, height: canvas.height }
          });
          
          // Validate the blob
          if (blob.size === 0) {
            console.error('❌ Generated blob is empty (0 bytes)');
            resolve(null);
            return;
          }
          
          resolve(blob);
        },
        'image/jpeg',
        0.95 // Higher quality
      );
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    if (!isImage) {
      // For videos, just return the original file (cropping videos is complex)
      onCropComplete(file);
      return;
    }

    // If no crop is set or crop is invalid, use original file
    if (!completedCrop || !completedCrop.width || !completedCrop.height) {
      console.log('No valid crop, using original file');
      onCropComplete(file);
      return;
    }

    setIsProcessing(true);
    try {
      // Try using the utility function first
      if (imgRef.current) {
        try {
          const croppedBlob = await cropImageToCanvas(imgRef.current, completedCrop);
          const fileName = file.name.replace(/\.[^/.]+$/, '') + '_cropped.jpg';
          const croppedFile = new File([croppedBlob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          console.log('✅ Cropped file created with utility function:', {
            name: croppedFile.name,
            size: croppedFile.size,
            type: croppedFile.type
          });
          
          // Validate the file before passing it on
          if (croppedFile.size === 0) {
            console.error('❌ Cropped file is empty, using original');
            onCropComplete(file);
          } else {
            onCropComplete(croppedFile);
          }
          return;
        } catch (utilError) {
          console.warn('Utility function failed, falling back to canvas method:', utilError);
        }
      }

      // Fallback to original canvas method
      const croppedBlob = await generateCroppedImage();
      if (croppedBlob) {
        // Create a new File object with the cropped image
        const fileName = file.name.replace(/\.[^/.]+$/, '') + '_cropped.jpg';
        const croppedFile = new File([croppedBlob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        console.log('✅ Cropped file created with fallback method:', {
          name: croppedFile.name,
          size: croppedFile.size,
          type: croppedFile.type
        });
        
        // Validate the file before passing it on
        if (croppedFile.size === 0) {
          console.error('❌ Cropped file is empty, using original');
          onCropComplete(file);
        } else {
          onCropComplete(croppedFile);
        }
      } else {
        console.log('Cropping failed, using original file');
        onCropComplete(file);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      onCropComplete(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const onImageLoad = useCallback((e) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    console.log('Image loaded:', { 
      displayed: { width, height }, 
      natural: { width: naturalWidth, height: naturalHeight } 
    });
    
    // Set initial crop to center 70% of image for better visibility
    const newCrop = {
      unit: '%',
      width: 70,
      height: 70,
      x: 15,
      y: 15
    };
    
    if (aspectRatio) {
      const imageAspect = naturalWidth / naturalHeight;
      if (imageAspect > aspectRatio) {
        // Image is wider than desired aspect ratio
        newCrop.height = 70;
        newCrop.width = 70 * aspectRatio * (naturalHeight / naturalWidth);
        newCrop.x = (100 - newCrop.width) / 2;
        newCrop.y = 15;
      } else {
        // Image is taller than desired aspect ratio
        newCrop.width = 70;
        newCrop.height = 70 * (naturalWidth / naturalHeight) / aspectRatio;
        newCrop.x = 15;
        newCrop.y = (100 - newCrop.height) / 2;
      }
    }
    
    console.log('Setting initial crop:', newCrop);
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }, [aspectRatio]);

  if (!file) return null;

  return (
    <div className="media-cropper-overlay">
      <div className="media-cropper-modal">
        <div className="cropper-header">
          <div className="cropper-title-row">
            <h3>
              {isVideo ? 'Video Preview' : 'Crop Image'}
            </h3>
            {progress && (
              <div className="crop-progress">
                {progress.current} of {progress.total}
              </div>
            )}
          </div>
          <p>
            {isVideo 
              ? 'Video cropping is not available. The video will be uploaded as-is.'
              : 'Adjust the crop area to focus on the important part of your image.'
            }
          </p>
        </div>

        <div className="cropper-content">
          {isImage ? (
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                src={objectUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                onError={(e) => {
                  console.error('Image load error in cropper:', e);
                }}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px',
                  display: 'block'
                }}
              />
            </ReactCrop>
          ) : (
            <div className="video-preview">
              <video
                src={objectUrl}
                controls
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
              <div className="video-info">
                <p>📹 Video files will be uploaded without cropping</p>
                <p>File: {file.name}</p>
                <p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          )}
        </div>

        <div className="cropper-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={isProcessing}
          >
            {progress ? 'Skip' : 'Cancel'}
          </button>
          {progress && progress.total > 1 && onSkipAll && (
            <button
              type="button"
              onClick={onSkipAll}
              className="skip-all-btn"
              disabled={isProcessing}
            >
              Skip All ({progress.total - progress.current + 1})
            </button>
          )}
          <button
            type="button"
            onClick={handleCropComplete}
            className="crop-btn"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="processing">
                <div className="spinner-small"></div>
                Processing...
              </div>
            ) : (
              isVideo ? 'Use Video' : 'Apply Crop'
            )}
          </button>
        </div>

        {/* Hidden canvas for generating cropped image */}
        <canvas
          ref={previewCanvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default MediaCropper;