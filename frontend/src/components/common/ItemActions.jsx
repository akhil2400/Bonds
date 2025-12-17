import { useState } from 'react';
import { usePermissions } from '../../context/PermissionContext';
import './ItemActions.css';

const ItemActions = ({ 
  item, 
  onEdit, 
  onDelete, 
  canEdit = true, 
  canDelete = true,
  showOwnerCheck = true 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isTrustedMember } = usePermissions();

  // Check if current user can edit/delete this item
  const isOwner = item.owner?._id === localStorage.getItem('userId') || 
                  item.owner?.email === localStorage.getItem('userEmail');
  
  const canPerformActions = isTrustedMember() && (!showOwnerCheck || isOwner || isTrustedMember());

  if (!canPerformActions) {
    return null;
  }

  const handleEdit = () => {
    setShowMenu(false);
    onEdit(item);
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete(item._id);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="item-actions">
        <button
          className="actions-trigger"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="More actions"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showMenu && (
          <div className="actions-menu">
            {canEdit && (
              <button onClick={handleEdit} className="action-item edit">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
            )}
            {canDelete && (
              <button onClick={handleDeleteClick} className="action-item delete">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L7.586 12l-1.293 1.293a1 1 0 101.414 1.414L9 13.414l2.293 2.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={handleDeleteCancel} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="menu-overlay" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};

export default ItemActions;