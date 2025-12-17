import { useState, useEffect } from 'react';
import { tripService } from '../services/tripService';
import PermissionGate from '../components/common/PermissionGate';
import ItemActions from '../components/common/ItemActions';
import { usePermissions } from '../context/PermissionContext';
import './Trips.css';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'public', 'my'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    isPublic: true
  });
  const [creating, setCreating] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { canCreate, isTrustedMember } = usePermissions();

  useEffect(() => {
    fetchTrips();
  }, [viewMode]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (viewMode) {
        case 'public':
          response = await tripService.getPublicTrips();
          break;
        case 'my':
          response = await tripService.getUserTrips();
          break;
        default:
          response = await tripService.getTrips();
      }
      
      setTrips(response.trips || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await tripService.createTrip({
        ...newTrip,
        budget: parseFloat(newTrip.budget)
      });
      setNewTrip({
        destination: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: '',
        isPublic: true
      });
      setShowCreateForm(false);
      fetchTrips();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditTrip = (trip) => {
    setEditingTrip({
      ...trip,
      startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
      endDate: trip.endDate ? trip.endDate.split('T')[0] : '',
      budget: trip.budget?.toString() || ''
    });
  };

  const handleUpdateTrip = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await tripService.updateTrip(editingTrip._id, {
        destination: editingTrip.destination,
        description: editingTrip.description,
        startDate: editingTrip.startDate,
        endDate: editingTrip.endDate,
        budget: parseFloat(editingTrip.budget),
        isPublic: editingTrip.isPublic
      });
      setEditingTrip(null);
      fetchTrips();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await tripService.deleteTrip(tripId);
      fetchTrips();
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
    <div className="trips-container">
      <div className="trips-header">
        <div className="header-content">
          <h1>Trips</h1>
          <p>
            {isTrustedMember() 
              ? 'Adventures and travel plans' 
              : 'Join us on our amazing adventures and journeys'
            }
          </p>
        </div>
        
        <div className="header-actions">
          {/* View Toggle */}
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('all')}
              className={viewMode === 'all' ? 'active' : ''}
            >
              All Trips
            </button>
            <button
              onClick={() => setViewMode('public')}
              className={viewMode === 'public' ? 'active' : ''}
            >
              Public
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={viewMode === 'my' ? 'active' : ''}
            >
              My Trips
            </button>
          </div>
          
          <PermissionGate action="create">
            <button 
              className="add-trip-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {showCreateForm ? 'Cancel' : 'Plan Trip'}
            </button>
          </PermissionGate>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          Error loading trips: {error}
        </div>
      )}

      {/* Create Trip Form */}
      {showCreateForm && canCreate() && (
        <div className="create-trip-form">
          <h3>Plan New Trip</h3>
          <form onSubmit={handleCreateTrip}>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Destination</label>
                <input
                  type="text"
                  required
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                  placeholder="Where are you going?"
                />
              </div>
              <div className="form-group">
                <label>Budget ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newTrip.budget}
                  onChange={(e) => setNewTrip({ ...newTrip, budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                required
                rows={3}
                value={newTrip.description}
                onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                placeholder="Describe your trip plans..."
              />
            </div>
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Start Date</label>
                <input
                  type="date"
                  required
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                />
              </div>
              <div className="form-group flex-1">
                <label>End Date</label>
                <input
                  type="date"
                  required
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-footer">
              <label className="privacy-toggle">
                <input
                  type="checkbox"
                  checked={newTrip.isPublic}
                  onChange={(e) => setNewTrip({ ...newTrip, isPublic: e.target.checked })}
                />
                <span>Make public</span>
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="primary">
                  {creating ? 'Planning...' : 'Plan Trip'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Edit Trip Form */}
      {editingTrip && (
        <div className="edit-trip-form">
          <h3>Edit Trip</h3>
          <form onSubmit={handleUpdateTrip}>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Destination</label>
                <input
                  type="text"
                  required
                  value={editingTrip.destination}
                  onChange={(e) => setEditingTrip({ ...editingTrip, destination: e.target.value })}
                  placeholder="Where are you going?"
                />
              </div>
              <div className="form-group">
                <label>Budget ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={editingTrip.budget}
                  onChange={(e) => setEditingTrip({ ...editingTrip, budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                required
                rows={3}
                value={editingTrip.description}
                onChange={(e) => setEditingTrip({ ...editingTrip, description: e.target.value })}
                placeholder="Describe your trip plans..."
              />
            </div>
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Start Date</label>
                <input
                  type="date"
                  required
                  value={editingTrip.startDate}
                  onChange={(e) => setEditingTrip({ ...editingTrip, startDate: e.target.value })}
                />
              </div>
              <div className="form-group flex-1">
                <label>End Date</label>
                <input
                  type="date"
                  required
                  value={editingTrip.endDate}
                  onChange={(e) => setEditingTrip({ ...editingTrip, endDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-footer">
              <label className="privacy-toggle">
                <input
                  type="checkbox"
                  checked={editingTrip.isPublic}
                  onChange={(e) => setEditingTrip({ ...editingTrip, isPublic: e.target.checked })}
                />
                <span>Make public</span>
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingTrip(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="primary">
                  {updating ? 'Updating...' : 'Update Trip'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="empty-state">
          <p>
            {!isTrustedMember() 
              ? 'No trips shared yet. The trusted members will share their adventures here!'
              : viewMode === 'my' 
                ? 'You haven\'t created any trips yet.' 
                : 'No trips found.'
            }
          </p>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => (
            <div key={trip._id} className="trip-card">
              {/* Header */}
              <div className="trip-header">
                <div className="trip-title-section">
                  <div className="trip-title-row">
                    <h3>{trip.destination}</h3>
                    <ItemActions
                      item={trip}
                      onEdit={handleEditTrip}
                      onDelete={handleDeleteTrip}
                    />
                  </div>
                  <span className={`privacy-badge ${trip.isPublic ? 'public' : 'private'}`}>
                    {trip.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <p className="trip-description">{trip.description}</p>
              </div>
              
              {/* Content */}
              <div className="trip-content">
                {/* Dates */}
                <div className="trip-detail">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                </div>
                
                {/* Budget */}
                <div className="trip-detail">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span>${trip.budget?.toLocaleString() || '0'}</span>
                </div>
                
                {/* Media count */}
                {trip.media && trip.media.length > 0 && (
                  <div className="trip-detail">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span>{trip.media.length} photos</span>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="trip-footer">
                By {trip.owner?.name || 'Unknown'} • {new Date(trip.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trips;