import { useState, useEffect } from 'react';
import { thoughtService } from '../services/thoughtService';
import PermissionGate from '../components/common/PermissionGate';
import ItemActions from '../components/common/ItemActions';
import { usePermissions } from '../context/PermissionContext';
import './Thoughts.css';

const Thoughts = () => {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThought, setNewThought] = useState({ title: '', content: '', isPrivate: true });
  const [creating, setCreating] = useState(false);
  const [editingThought, setEditingThought] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { canCreate, isTrustedMember } = usePermissions();

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      setLoading(true);
      const response = await thoughtService.getThoughts();
      setThoughts(response.thoughts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThought = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await thoughtService.createThought(newThought);
      setNewThought({ title: '', content: '', isPrivate: true });
      setShowCreateForm(false);
      fetchThoughts();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditThought = (thought) => {
    setEditingThought({ ...thought });
  };

  const handleUpdateThought = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await thoughtService.updateThought(editingThought._id, {
        title: editingThought.title,
        content: editingThought.content,
        isPrivate: editingThought.isPrivate
      });
      setEditingThought(null);
      fetchThoughts();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteThought = async (thoughtId) => {
    try {
      await thoughtService.deleteThought(thoughtId);
      fetchThoughts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="thoughts-container">
      <div className="thoughts-header">
        <div className="header-content">
          <h1>Thoughts</h1>
          <p>
            {isTrustedMember() 
              ? 'Personal reflections and musings' 
              : 'Heartfelt thoughts and reflections from our friends'
            }
          </p>
        </div>
        <PermissionGate action="create">
          <button
            className="add-thought-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {showCreateForm ? 'Cancel' : 'New Thought'}
          </button>
        </PermissionGate>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && canCreate() && (
        <div className="create-thought-form">
          <h3>Share Your Thoughts</h3>
          <form onSubmit={handleCreateThought}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                required
                value={newThought.title}
                onChange={(e) => setNewThought({ ...newThought, title: e.target.value })}
                placeholder="What's on your mind?"
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                required
                rows={4}
                value={newThought.content}
                onChange={(e) => setNewThought({ ...newThought, content: e.target.value })}
                placeholder="Share your thoughts..."
              />
            </div>
            <div className="form-footer">
              <label className="privacy-toggle">
                <input
                  type="checkbox"
                  checked={newThought.isPrivate}
                  onChange={(e) => setNewThought({ ...newThought, isPrivate: e.target.checked })}
                />
                <span>Keep private</span>
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="primary">
                  {creating ? 'Creating...' : 'Share Thought'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Edit Thought Form */}
      {editingThought && (
        <div className="edit-thought-form">
          <h3>Edit Thought</h3>
          <form onSubmit={handleUpdateThought}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                required
                value={editingThought.title}
                onChange={(e) => setEditingThought({ ...editingThought, title: e.target.value })}
                placeholder="What's on your mind?"
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                required
                rows={4}
                value={editingThought.content}
                onChange={(e) => setEditingThought({ ...editingThought, content: e.target.value })}
                placeholder="Share your thoughts..."
              />
            </div>
            <div className="form-footer">
              <label className="privacy-toggle">
                <input
                  type="checkbox"
                  checked={editingThought.isPrivate}
                  onChange={(e) => setEditingThought({ ...editingThought, isPrivate: e.target.checked })}
                />
                <span>Keep private</span>
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingThought(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="primary">
                  {updating ? 'Updating...' : 'Update Thought'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Thoughts List */}
      {thoughts.length === 0 ? (
        <div className="empty-state">
          <p>
            {isTrustedMember() 
              ? 'No thoughts yet. Share what\'s on your mind!' 
              : 'No thoughts shared yet. The trusted members will share their reflections here!'
            }
          </p>
        </div>
      ) : (
        <div className="thoughts-list">
          {thoughts.map((thought) => (
            <div key={thought._id} className="thought-card">
              <div className="thought-header">
                <div className="thought-title-row">
                  <h3>{thought.title}</h3>
                  <ItemActions
                    item={thought}
                    onEdit={handleEditThought}
                    onDelete={handleDeleteThought}
                  />
                </div>
                {thought.isPrivate && (
                  <span className="private-badge">
                    Private
                  </span>
                )}
              </div>
              <p className="thought-content">{thought.content}</p>
              <div className="thought-footer">
                <span>By {thought.owner?.name || 'Unknown'}</span>
                <span>{new Date(thought.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Thoughts;