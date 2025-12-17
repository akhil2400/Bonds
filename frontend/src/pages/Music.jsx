import { useState, useEffect } from 'react';
import { musicService } from '../services/musicService';
import PermissionGate from '../components/common/PermissionGate';
import ItemActions from '../components/common/ItemActions';
import { usePermissions } from '../context/PermissionContext';
import './Music.css';

const Music = () => {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMusic, setNewMusic] = useState({
    title: '',
    artist: '',
    platform: 'Spotify',
    link: '',
    description: '',
    isPrivate: false
  });
  const [creating, setCreating] = useState(false);
  const [editingMusic, setEditingMusic] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { canCreate, isTrustedMember } = usePermissions();

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      setLoading(true);
      const response = await musicService.getMusic();
      setMusic(response.music || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMusic = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await musicService.createMusic(newMusic);
      setNewMusic({
        title: '',
        artist: '',
        platform: 'Spotify',
        link: '',
        description: '',
        isPrivate: false
      });
      setShowCreateForm(false);
      fetchMusic();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditMusic = (track) => {
    setEditingMusic({ ...track });
  };

  const handleUpdateMusic = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await musicService.updateMusic(editingMusic._id, {
        title: editingMusic.title,
        artist: editingMusic.artist,
        platform: editingMusic.platform,
        link: editingMusic.link,
        description: editingMusic.description,
        isPrivate: editingMusic.isPrivate
      });
      setEditingMusic(null);
      fetchMusic();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteMusic = async (musicId) => {
    try {
      await musicService.deleteMusic(musicId);
      fetchMusic();
    } catch (err) {
      setError(err.message);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Spotify':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
        );
      case 'YouTube':
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">Y</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">♪</span>
          </div>
        );
    }
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
        Error loading music: {error}
      </div>
    );
  }

  return (
    <div className="music-container">
      <div className="music-header">
        <div className="header-content">
          <h1>Our Music</h1>
          <p>
            {isTrustedMember() 
              ? 'Songs that soundtrack our friendship' 
              : 'Discover the music that defines our friendship'
            }
          </p>
        </div>
        <PermissionGate action="create">
          <button 
            className="add-music-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {showCreateForm ? 'Cancel' : 'Add Music'}
          </button>
        </PermissionGate>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Create Music Form */}
      {showCreateForm && canCreate() && (
        <div className="create-music-form">
          <h3>Add Music Track</h3>
          <form onSubmit={handleCreateMusic}>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Song Title</label>
                <input
                  type="text"
                  required
                  value={newMusic.title}
                  onChange={(e) => setNewMusic({ ...newMusic, title: e.target.value })}
                  placeholder="Song title..."
                />
              </div>
              <div className="form-group flex-1">
                <label>Artist</label>
                <input
                  type="text"
                  required
                  value={newMusic.artist}
                  onChange={(e) => setNewMusic({ ...newMusic, artist: e.target.value })}
                  placeholder="Artist name..."
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Platform</label>
                <select
                  value={newMusic.platform}
                  onChange={(e) => setNewMusic({ ...newMusic, platform: e.target.value })}
                >
                  <option value="Spotify">Spotify</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Apple Music">Apple Music</option>
                  <option value="SoundCloud">SoundCloud</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label>Link</label>
                <input
                  type="url"
                  required
                  value={newMusic.link}
                  onChange={(e) => setNewMusic({ ...newMusic, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                rows={2}
                value={newMusic.description}
                onChange={(e) => setNewMusic({ ...newMusic, description: e.target.value })}
                placeholder="Why this song is special..."
              />
            </div>
            
            <div className="form-footer">
              <label className="privacy-toggle">
                <input
                  type="checkbox"
                  checked={newMusic.isPrivate}
                  onChange={(e) => setNewMusic({ ...newMusic, isPrivate: e.target.checked })}
                />
                <span>Keep private</span>
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="primary">
                  {creating ? 'Adding...' : 'Add Track'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Edit Music Form */}
      {editingMusic && (
        <div className="edit-music-form">
          <h3>Edit Music Track</h3>
          <form onSubmit={handleUpdateMusic}>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Song Title</label>
                <input
                  type="text"
                  required
                  value={editingMusic.title}
                  onChange={(e) => setEditingMusic({ ...editingMusic, title: e.target.value })}
                  placeholder="Song title..."
                />
              </div>
              <div className="form-group flex-1">
                <label>Artist</label>
                <input
                  type="text"
                  required
                  value={editingMusic.artist}
                  onChange={(e) => setEditingMusic({ ...editingMusic, artist: e.target.value })}
                  placeholder="Artist name..."
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Platform</label>
                <select
                  value={editingMusic.platform}
                  onChange={(e) => setEditingMusic({ ...editingMusic, platform: e.target.value })}
                >
                  <option value="Spotify">Spotify</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Apple Music">Apple Music</option>
                  <option value="SoundCloud">SoundCloud</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label>Link</label>
                <input
                  type="url"
                  required
                  value={editingMusic.link}
                  onChange={(e) => setEditingMusic({ ...editingMusic, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                rows={2}
                value={editingMusic.description}
                onChange={(e) => setEditingMusic({ ...editingMusic, description: e.target.value })}
                placeholder="Why this song is special..."
              />
            </div>
            
            <div className="form-footer">
              <label className="privacy-toggle">
                <input
                  type="checkbox"
                  checked={editingMusic.isPrivate}
                  onChange={(e) => setEditingMusic({ ...editingMusic, isPrivate: e.target.checked })}
                />
                <span>Keep private</span>
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingMusic(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="primary">
                  {updating ? 'Updating...' : 'Update Track'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {music.length === 0 ? (
        <div className="empty-state">
          <p>
            {isTrustedMember() 
              ? 'No music tracks yet. Start sharing your favorites!' 
              : 'No music shared yet. The trusted members will share their favorite songs here!'
            }
          </p>
        </div>
      ) : (
        <div className="music-list">
          {music.map((track) => (
            <div key={track._id} className="music-card">
              <div className="music-content">
                {/* Platform Icon */}
                <div className="platform-icon">
                  {getPlatformIcon(track.platform)}
                </div>
                
                {/* Track Info */}
                <div className="track-info">
                  <div className="track-header">
                    <div className="track-title-row">
                      <h3>{track.title}</h3>
                      <ItemActions
                        item={track}
                        onEdit={handleEditMusic}
                        onDelete={handleDeleteMusic}
                      />
                    </div>
                    {track.isPrivate && (
                      <span className="private-badge">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="artist">by {track.artist}</p>
                  {track.description && (
                    <p className="description">{track.description}</p>
                  )}
                  <div className="track-footer">
                    <div className="track-meta">
                      <span className="platform">
                        <span className="platform-dot"></span>
                        {track.platform}
                      </span>
                      <span>Added by {track.owner?.name || 'Unknown'}</span>
                      <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Play Button */}
                    <a
                      href={track.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="play-btn"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span>Play</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Music;