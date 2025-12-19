import { useState, useEffect } from 'react';
import { memoryService } from '../services/memoryService';
import PermissionGate from '../components/common/PermissionGate';
import ItemActions from '../components/common/ItemActions';
import MediaCropper from '../components/common/MediaCropper';
import { usePermissions } from '../context/PermissionContext';
import { debugImageFile, validateImageFile, validateVideoFile, createSafeObjectURL, revokeSafeObjectURL } from '../utils/imageUtils';
import './Memories.css';

const Memories = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [privacyFilter, setPrivacyFilter] = useState('all'); // 'all', 'public', 'private'
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    media: [],
    selectedFiles: [],
    isPrivate: true
  });
  const [creating, setCreating] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [cropperFile, setCropperFile] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const { canCreate, isTrustedMember } = usePermissions();

  useEffect(() => {
    fetchMemories();
  }, []);

  // Cleanup URLs when component unmounts or memory changes
  useEffect(() => {
    return () => {
      // Cleanup any object URLs to prevent memory leaks
      newMemory.media.forEach(item => {
        revokeSafeObjectURL(item.url);
      });
    };
  }, [newMemory.media]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await memoryService.getMemories();
      setMemories(response.memories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', newMemory.title);
      formData.append('description', newMemory.description);
      formData.append('isPrivate', newMemory.isPrivate);
      
      // Add files to FormData (both images and videos)
      if (newMemory.selectedFiles && newMemory.selectedFiles.length > 0) {
        newMemory.selectedFiles.forEach(file => {
          formData.append('media', file);
        });
      }
      
      await memoryService.createMemoryWithMedia(formData);
      setNewMemory({ title: '', description: '', media: [], selectedFiles: [], isPrivate: true });
      setShowCreateForm(false);
      fetchMemories();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditMemory = (memory) => {
    setEditingMemory({ ...memory });
  };

  const handleUpdateMemory = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await memoryService.updateMemory(editingMemory._id, {
        title: editingMemory.title,
        description: editingMemory.description,
        isPrivate: editingMemory.isPrivate
      });
      setEditingMemory(null);
      fetchMemories();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    try {
      await memoryService.deleteMemory(memoryId);
      fetchMemories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    console.log('Files selected:', files.length);
    
    try {
      // Validate and separate files
      const imageFiles = [];
      const videoFiles = [];
      
      files.forEach(file => {
        debugImageFile(file, 'Selected file');
        
        if (file.type.startsWith('image/')) {
          validateImageFile(file);
          imageFiles.push(file);
        } else if (file.type.startsWith('video/')) {
          validateVideoFile(file);
          videoFiles.push(file);
        } else {
          console.warn('Unsupported file type:', file.type);
        }
      });
      
      console.log('Valid files - Images:', imageFiles.length, 'Videos:', videoFiles.length);
      
      // Add videos directly (no cropping needed)
      const videoMedia = videoFiles.map(file => ({
        url: createSafeObjectURL(file),
        file: file,
        type: 'video',
        name: file.name
      }));
      
      if (imageFiles.length > 0) {
        // Start cropping process for images
        setPendingFiles(imageFiles);
        setCurrentCropIndex(0);
        setCropperFile(imageFiles[0]);
        
        // Add videos to current media
        if (videoFiles.length > 0) {
          setNewMemory(prev => ({
            ...prev,
            selectedFiles: [...prev.selectedFiles, ...videoFiles],
            media: [...prev.media, ...videoMedia]
          }));
        }
      } else {
        // Only videos, add them directly
        setNewMemory(prev => ({
          ...prev,
          selectedFiles: [...prev.selectedFiles, ...videoFiles],
          media: [...prev.media, ...videoMedia]
        }));
      }
    } catch (error) {
      console.error('File validation error:', error);
      setError(error.message);
    }
    
    // Clear the input
    e.target.value = '';
  };

  // Add function to skip cropping for all images
  const handleSkipAllCropping = () => {
    console.log('Skipping cropping for all pending files');
    
    const allImageMedia = pendingFiles.map(file => ({
      url: createSafeObjectURL(file),
      file: file,
      type: 'image',
      name: file.name
    }));
    
    setNewMemory(prev => ({
      ...prev,
      selectedFiles: [...prev.selectedFiles, ...pendingFiles],
      media: [...prev.media, ...allImageMedia]
    }));
    
    // Close cropper
    setCropperFile(null);
    setPendingFiles([]);
    setCurrentCropIndex(0);
  };

  const handleCropComplete = (croppedFile) => {
    console.log('🎯 Crop completed for file:', {
      name: croppedFile.name,
      size: croppedFile.size,
      type: croppedFile.type,
      lastModified: croppedFile.lastModified
    });
    
    // Create object URL for preview
    const previewUrl = createSafeObjectURL(croppedFile);
    console.log('🔗 Created preview URL:', previewUrl);
    
    if (!previewUrl) {
      console.error('❌ Failed to create preview URL for cropped file');
      // Fallback: try to use original file
      const originalFile = pendingFiles[currentCropIndex];
      const fallbackUrl = createSafeObjectURL(originalFile);
      const newMedia = {
        url: fallbackUrl,
        file: originalFile,
        type: 'image',
        name: originalFile.name
      };
      
      setNewMemory(prev => ({
        ...prev,
        selectedFiles: [...prev.selectedFiles, originalFile],
        media: [...prev.media, newMedia]
      }));
    } else {
      // Add the cropped file to the memory
      const newMedia = {
        url: previewUrl,
        file: croppedFile,
        type: 'image',
        name: croppedFile.name
      };
      
      console.log('✅ Adding cropped media to preview:', newMedia);
      
      setNewMemory(prev => ({
        ...prev,
        selectedFiles: [...prev.selectedFiles, croppedFile],
        media: [...prev.media, newMedia]
      }));
    }
    
    // Move to next file or close cropper
    const nextIndex = currentCropIndex + 1;
    if (nextIndex < pendingFiles.length) {
      setCurrentCropIndex(nextIndex);
      setCropperFile(pendingFiles[nextIndex]);
    } else {
      // Done with all files
      setCropperFile(null);
      setPendingFiles([]);
      setCurrentCropIndex(0);
    }
  };

  const handleCropCancel = () => {
    console.log('Crop cancelled/skipped for current file');
    
    // If skipping, add the original file (always add when skipping individual files)
    const originalFile = pendingFiles[currentCropIndex];
    const previewUrl = createSafeObjectURL(originalFile);
    console.log('Created preview URL for skipped file:', previewUrl);
    
    const newMedia = {
      url: previewUrl,
      file: originalFile,
      type: 'image',
      name: originalFile.name
    };
    
    setNewMemory(prev => ({
      ...prev,
      selectedFiles: [...prev.selectedFiles, originalFile],
      media: [...prev.media, newMedia]
    }));
    
    // Move to next file or close cropper
    const nextIndex = currentCropIndex + 1;
    if (nextIndex < pendingFiles.length) {
      setCurrentCropIndex(nextIndex);
      setCropperFile(pendingFiles[nextIndex]);
    } else {
      // Done with all files
      setCropperFile(null);
      setPendingFiles([]);
      setCurrentCropIndex(0);
    }
  };

  const renderPrivacyBadge = (memory) => {
    // Only show privacy badges for trusted members
    if (!isTrustedMember()) return null;
    
    return (
      <div className={`memory-privacy-badge ${memory.isPrivate ? 'private' : 'public'}`}>
        {memory.isPrivate ? (
          <>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
            </svg>
            Private
          </>
        ) : (
          <>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Public
          </>
        )}
      </div>
    );
  };

  const renderMemoryMedia = (memory) => {
    if (!memory.media || memory.media.length === 0) return null;
    
    const firstMedia = memory.media[0];
    
    // Handle Cloudinary object format
    if (firstMedia && typeof firstMedia === 'object' && firstMedia.url) {
      const isVideo = firstMedia.resourceType === 'video' || firstMedia.format === 'mp4' || firstMedia.format === 'mov';
      
      return (
        <div className="memory-media">
          {isVideo ? (
            <video
              src={firstMedia.url}
              alt={memory.title}
              controls
              preload="metadata"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <img
              src={firstMedia.url}
              alt={memory.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          {renderPrivacyBadge(memory)}
          {memory.media.length > 1 && (
            <div className="media-count-badge">
              +{memory.media.length - 1}
            </div>
          )}
        </div>
      );
    }
    
    // Handle old string format (if any exist)
    if (firstMedia && typeof firstMedia === 'string') {
      return (
        <div className="memory-media">
          <img
            src={firstMedia}
            alt={memory.title}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {renderPrivacyBadge(memory)}
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        Error loading memories: {error}
      </div>
    );
  }

  return (
    <div className="memories-container">
      <div className="memories-header">
        <div className="header-content">
          <h1>Our Memories</h1>
          <p>
            {isTrustedMember() 
              ? 'Precious moments captured in time' 
              : 'Beautiful moments shared by our trusted friends'
            }
          </p>
        </div>
        <PermissionGate action="create">
          <button 
            className="add-memory-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {showCreateForm ? 'Cancel' : 'Add Memory'}
          </button>
        </PermissionGate>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Privacy Filter - Only show for trusted members */}
      {isTrustedMember() && (
        <div className="privacy-filter">
          <label>Filter by Privacy:</label>
          <div className="filter-options">
            <button 
              className={`filter-btn ${privacyFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPrivacyFilter('all')}
            >
              All Memories
            </button>
            <button 
              className={`filter-btn ${privacyFilter === 'public' ? 'active' : ''}`}
              onClick={() => setPrivacyFilter('public')}
            >
              Public Only
            </button>
            <button 
              className={`filter-btn ${privacyFilter === 'private' ? 'active' : ''}`}
              onClick={() => setPrivacyFilter('private')}
            >
              Private Only
            </button>
          </div>
        </div>
      )}

      {/* Create Memory Form */}
      {showCreateForm && canCreate() && (
        <div className="create-memory-form">
          <h3>Create New Memory</h3>
          <form onSubmit={handleCreateMemory}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                required
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                placeholder="Give your memory a title..."
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                required
                rows={3}
                value={newMemory.description}
                onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                placeholder="Describe this precious moment..."
              />
            </div>
            
            <div className="form-group">
              <label>Privacy Setting</label>
              <div className="privacy-options">
                <label className="privacy-option">
                  <input
                    type="radio"
                    name="privacy"
                    value="true"
                    checked={newMemory.isPrivate === true}
                    onChange={(e) => setNewMemory({ ...newMemory, isPrivate: true })}
                  />
                  <span className="privacy-label">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                    </svg>
                    Private (Only trusted members can see)
                  </span>
                </label>
                <label className="privacy-option">
                  <input
                    type="radio"
                    name="privacy"
                    value="false"
                    checked={newMemory.isPrivate === false}
                    onChange={(e) => setNewMemory({ ...newMemory, isPrivate: false })}
                  />
                  <span className="privacy-label">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Public (All members can see)
                  </span>
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Photos & Videos</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="file-input"
              />
              <div className="file-help-text">
                📸 Images will open a crop editor for perfect framing<br/>
                🎥 Videos will be uploaded as-is (cropping not available)<br/>
                Supported: JPG, PNG, GIF, MP4, MOV, AVI
              </div>
              {newMemory.media.length > 0 && (
                <div className="media-preview">
                  {newMemory.media.map((item, index) => (
                    <div key={index} className="preview-item" style={{ position: 'relative' }}>
                      {item.type === 'video' ? (
                        <video 
                          src={item.url} 
                          controls 
                          preload="metadata"
                          onError={(e) => {
                            console.error('Video preview error:', e);
                          }}
                        />
                      ) : (
                        <>
                          <img 
                            src={item.url} 
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              backgroundColor: '#f3f4f6'
                            }}
                            onLoad={(e) => {
                              console.log('✅ Image preview loaded successfully:', {
                                index: index,
                                url: item.url,
                                fileName: item.name,
                                naturalWidth: e.target.naturalWidth,
                                naturalHeight: e.target.naturalHeight,
                                displayWidth: e.target.width,
                                displayHeight: e.target.height
                              });
                              // Hide loading indicator if any
                              const loadingDiv = e.target.parentElement.querySelector('.loading-indicator');
                              if (loadingDiv) loadingDiv.style.display = 'none';
                            }}
                            onError={(e) => {
                              console.error('❌ Image preview error:', {
                                index: index,
                                error: e.type,
                                url: item.url,
                                fileName: item.name,
                                fileSize: item.file?.size,
                                fileType: item.file?.type
                              });
                              
                              // Hide loading indicator
                              const loadingDiv = e.target.parentElement.querySelector('.loading-indicator');
                              if (loadingDiv) loadingDiv.style.display = 'none';
                              
                              // Show a placeholder or try to recreate the URL
                              if (item.file && item.url.startsWith('blob:')) {
                                console.log('🔄 Attempting to recreate blob URL...');
                                const newUrl = createSafeObjectURL(item.file);
                                if (newUrl) {
                                  console.log('🔗 New URL created:', newUrl);
                                  e.target.src = newUrl;
                                  // Update the media item with new URL
                                  setNewMemory(prev => ({
                                    ...prev,
                                    media: prev.media.map((mediaItem, mediaIndex) => 
                                      mediaIndex === index ? { ...mediaItem, url: newUrl } : mediaItem
                                    )
                                  }));
                                } else {
                                  console.error('❌ Failed to recreate URL');
                                  // Show error placeholder
                                  e.target.style.backgroundColor = '#fee2e2';
                                  e.target.style.border = '2px dashed #ef4444';
                                  e.target.style.display = 'flex';
                                  e.target.style.alignItems = 'center';
                                  e.target.style.justifyContent = 'center';
                                  e.target.alt = '❌ Preview Error';
                                }
                              }
                            }}
                          />
                          <div 
                            className="loading-indicator"
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              background: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              padding: '8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              pointerEvents: 'none'
                            }}
                          >
                            Loading...
                          </div>
                        </>
                      )}
                      <div className="media-type-badge">
                        {item.type === 'video' ? '🎥' : '📷'}
                      </div>
                      <div className="media-name">
                        {item.name || `${item.type} ${index + 1}`}
                      </div>
                      <button
                        type="button"
                        className="remove-media"
                        onClick={() => {
                          // Cleanup URL before removing
                          revokeSafeObjectURL(item.url);
                          
                          const newFiles = [...newMemory.selectedFiles];
                          const newMedia = [...newMemory.media];
                          newFiles.splice(index, 1);
                          newMedia.splice(index, 1);
                          setNewMemory(prev => ({
                            ...prev,
                            selectedFiles: newFiles,
                            media: newMedia
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button type="submit" disabled={creating} className="primary">
                {creating ? 'Creating...' : 'Create Memory'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Memory Form */}
      {editingMemory && (
        <div className="edit-memory-form">
          <h3>Edit Memory</h3>
          <form onSubmit={handleUpdateMemory}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                required
                value={editingMemory.title}
                onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                placeholder="Give your memory a title..."
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                required
                rows={3}
                value={editingMemory.description}
                onChange={(e) => setEditingMemory({ ...editingMemory, description: e.target.value })}
                placeholder="Describe this precious moment..."
              />
            </div>
            
            <div className="form-group">
              <label>Privacy Setting</label>
              <div className="privacy-options">
                <label className="privacy-option">
                  <input
                    type="radio"
                    name="editPrivacy"
                    value="true"
                    checked={editingMemory.isPrivate === true}
                    onChange={(e) => setEditingMemory({ ...editingMemory, isPrivate: true })}
                  />
                  <span className="privacy-label">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                    </svg>
                    Private (Only trusted members can see)
                  </span>
                </label>
                <label className="privacy-option">
                  <input
                    type="radio"
                    name="editPrivacy"
                    value="false"
                    checked={editingMemory.isPrivate === false}
                    onChange={(e) => setEditingMemory({ ...editingMemory, isPrivate: false })}
                  />
                  <span className="privacy-label">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Public (All members can see)
                  </span>
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setEditingMemory(null)}>
                Cancel
              </button>
              <button type="submit" disabled={updating} className="primary">
                {updating ? 'Updating...' : 'Update Memory'}
              </button>
            </div>
          </form>
        </div>
      )}

      {(() => {
        // Filter memories based on user role and privacy filter
        const filteredMemories = memories.filter(memory => {
          // For viewers: only show public memories (no filtering options)
          if (!isTrustedMember()) {
            return !memory.isPrivate;
          }
          
          // For trusted members: apply privacy filter
          if (privacyFilter === 'all') return true;
          if (privacyFilter === 'public') return !memory.isPrivate;
          if (privacyFilter === 'private') return memory.isPrivate;
          return true;
        });

        return filteredMemories.length === 0 ? (
          <div className="empty-state">
            <p>
              {!isTrustedMember() 
                ? 'No shared memories yet. The trusted members will share beautiful moments here!' 
                : privacyFilter === 'all' 
                  ? 'No memories yet. Start capturing your moments!' 
                  : `No ${privacyFilter} memories found.`
              }
            </p>
          </div>
        ) : (
          <div className="memories-grid">
            {filteredMemories.map((memory) => (
              <div key={memory._id} className="memory-card">
                {/* Image */}
                {renderMemoryMedia(memory)}
                
                {/* Privacy badge for memories without images */}
                {(!memory.media || memory.media.length === 0 || !memory.media.some(item => 
                  (typeof item === 'object' && item.url) || (typeof item === 'string' && item.length > 0)
                )) && (
                  <div className="memory-content-header">
                    {renderPrivacyBadge(memory)}
                  </div>
                )}
                
                {/* Content */}
                <div className="memory-content">
                  <div className="memory-header">
                    <h3>{memory.title}</h3>
                    <ItemActions
                      item={memory}
                      onEdit={handleEditMemory}
                      onDelete={handleDeleteMemory}
                    />
                  </div>
                  <p className="memory-description">{memory.description}</p>
                  
                  {/* Media count */}
                  {(() => {
                    const validMediaCount = memory.media ? memory.media.filter(item => 
                      (typeof item === 'object' && item.url) || (typeof item === 'string' && item.length > 0)
                    ).length : 0;
                    
                    return validMediaCount > 1 ? (
                      <div className="media-count">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {validMediaCount} photos
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Footer */}
                  <div className="memory-footer">
                    <span>By {memory.owner?.name || 'Unknown'}</span>
                    <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Media Cropper Modal */}
      {cropperFile && (
        <MediaCropper
          file={cropperFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onSkipAll={handleSkipAllCropping}
          aspectRatio={null} // Free crop, or set to 1 for square, 16/9 for widescreen, etc.
          progress={pendingFiles.length > 1 ? {
            current: currentCropIndex + 1,
            total: pendingFiles.length
          } : null}
        />
      )}
    </div>
  );
};

export default Memories;