import { useState, useEffect } from 'react';
import { memoryService } from '../services/memoryService';
import './Memories.css';

const Memories = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemories();
  }, []);

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
        <h1>Our Memories</h1>
        <p>Precious moments captured in time</p>
      </div>

      {memories.length === 0 ? (
        <div className="empty-state">
          <p>No memories yet. Start capturing your moments!</p>
        </div>
      ) : (
        <div className="memories-grid">
          {memories.map((memory) => (
            <div key={memory._id} className="memory-card">
              {/* Image */}
              {memory.media && memory.media.length > 0 && (
                <div className="memory-image">
                  <img
                    src={memory.media[0]}
                    alt={memory.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="memory-content">
                <h3>{memory.title}</h3>
                <p className="memory-description">{memory.description}</p>
                
                {/* Media count */}
                {memory.media && memory.media.length > 1 && (
                  <div className="media-count">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    {memory.media.length} photos
                  </div>
                )}
                
                {/* Footer */}
                <div className="memory-footer">
                  <span>By {memory.owner?.name || 'Unknown'}</span>
                  <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Memories;