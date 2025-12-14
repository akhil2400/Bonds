import { useState, useEffect } from 'react';
import { musicService } from '../services/musicService';

const Music = () => {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error loading music: {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Music</h1>
        <p className="text-gray-600">Songs that soundtrack our friendship</p>
      </div>

      {music.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No music tracks yet. Start sharing your favorites!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {music.map((track) => (
            <div key={track._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                {/* Platform Icon */}
                {getPlatformIcon(track.platform)}
                
                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {track.title}
                    </h3>
                    {track.isPrivate && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">by {track.artist}</p>
                  {track.description && (
                    <p className="text-sm text-gray-500 mb-2">{track.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {track.platform}
                      </span>
                      <span>Added by {track.owner.name}</span>
                      <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Play Button */}
                    <a
                      href={track.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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