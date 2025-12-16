import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuthStatus } = useAuth();

  // Check auth status when accessing protected route
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && !isAuthenticated && !loading) {
      checkAuthStatus();
    }
  }, [isAuthenticated, loading, checkAuthStatus]);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;