import { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './MediaCropper.css';

const MediaCropper = ({ 
  file, 
  onCropComplete, 
  onCancel, 
  aspectRatio = null, // null for free crop, or number like 16/9, 1, etc.
  progress = null // { current: 1, total: 3 } for showing progress
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

  // Generate canvas for cropped image
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    if (!isImage) {
      // For videos, just return the original file (cropping videos is complex)
      onCropComplete(file);
      return;
    }

    if (!completedCrop) {
      onCropComplete(file);
      return;
    }

    setIsProcessing(true);
    try {
      const croppedBlob = await generateCroppedImage();
      if (croppedBlob) {
        // Create a new File object with the cropped image
        const croppedFile = new File([croppedBlob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        onCropComplete(croppedFile);
      } else {
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
    const { width, height } = e.currentTarget;
    
    // Set initial crop to center 90% of image
    const newCrop = {
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    };
    
    if (aspectRatio) {
      const imageAspect = width / height;
      if (imageAspect > aspectRatio) {
        // Image is wider than desired aspect ratio
        newCrop.height = 90;
        newCrop.width = (90 * aspectRatio * height) / width;
        newCrop.x = (100 - newCrop.width) / 2;
      } else {
        // Image is taller than desired aspect ratio
        newCrop.width = 90;
        newCrop.height = (90 * width) / (aspectRatio * height);
        newCrop.y = (100 - newCrop.height) / 2;
      }
    }
    
    setCrop(newCrop);
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
                src={URL.createObjectURL(file)}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            </ReactCrop>
          ) : (
            <div className="video-preview">
              <video
                src={URL.createObjectURL(file)}
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