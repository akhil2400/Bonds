import { useState, useEffect } from 'react';
import { timelineService } from '../services/timelineService';
import PermissionGate from '../components/common/PermissionGate';
import { usePermissions } from '../context/PermissionContext';
import './Timeline.css';

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTimeline, setNewTimeline] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    media: []
  });
  const [creating, setCreating] = useState(false);
  const { canCreate, isTrustedMember } = usePermissions();

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      setLoading(true);
      const response = await timelineService.getTimelines();
      setTimelines(response.timelines || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimeline = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await timelineService.createTimeline(newTimeline);
      setNewTimeline({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        media: []
      });
      setShowCreateForm(false);
      fetchTimelines();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error loading timeline: {error}
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div className="header-content">
          <h1>Our Timeline</h1>
          <p>
            {isTrustedMember() 
              ? 'The journey of our friendship through the years' 
              : 'Witness the beautiful journey of our friendship'
            }
          </p>
        </div>
        <PermissionGate action="create">
          <button 
            className="add-timeline-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {showCreateForm ? 'Cancel' : 'Add Timeline'}
          </button>
        </PermissionGate>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Create Timeline Form */}
      {showCreateForm && canCreate() && (
        <div className="create-timeline-form">
          <h3>Add Timeline Entry</h3>
          <form onSubmit={handleCreateTimeline}>
            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  required
                  min="1900"
                  max="2100"
                  value={newTimeline.year}
                  onChange={(e) => setNewTimeline({ ...newTimeline, year: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group flex-1">
                <label>Title</label>
                <input
                  type="text"
                  required
                  value={newTimeline.title}
                  onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
                  placeholder="What happened this year?"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                required
                rows={3}
                value={newTimeline.description}
                onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
                placeholder="Tell the story of this moment in time..."
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button type="submit" disabled={creating} className="primary">
                {creating ? 'Adding...' : 'Add to Timeline'}
              </button>
            </div>
          </form>
        </div>
      )}

      {timelines.length === 0 ? (
        <div className="empty-state">
          <p>
            {isTrustedMember() 
              ? 'No timeline entries yet. Start creating memories!' 
              : 'No timeline entries shared yet. The trusted members will share their journey here!'
            }
          </p>
        </div>
      ) : (
        <div className="timeline-list">
          {timelines.map((timeline) => (
            <div key={timeline._id} className="timeline-item">
              {/* Timeline line */}
              <div className="timeline-line"></div>
              
              {/* Timeline content */}
              <div className="timeline-content">
                {/* Year badge */}
                <div className="year-badge">
                  {timeline.year}
                </div>
                
                {/* Content card */}
                <div className="timeline-card">
                  <h3>{timeline.title}</h3>
                  <p>{timeline.description}</p>
                  
                  {timeline.media && timeline.media.length > 0 && (
                    <div className="timeline-media">
                      {timeline.media.slice(0, 3).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt=""
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="timeline-footer">
                    By {timeline.owner?.name || 'Unknown'} • {new Date(timeline.createdAt).toLocaleDateString()}
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

export default Timeline;