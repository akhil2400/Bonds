import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Login.css'; // Reusing login styles

const Signup = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) clearError();
    if (validationError) setValidationError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.name || !formData.email) {
      setValidationError('Name and email are required');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting signup process with data:', {
        name: formData.name,
        email: formData.email
      });

      // Direct signup - creates account immediately
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Signup successful:', response);
      
      // Show success message
      setSuccessMessage('Account created successfully! Redirecting to login...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please sign in with your credentials.',
            email: formData.email 
          } 
        });
      }, 2000);
      
    } catch (err) {
      console.error('Signup failed:', err);
      setValidationError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = error || validationError;

  return (
    <div className="login-container page-enter">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>Create your space</h2>
          <p>A quiet place for your friendship memories</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {displayError && (
            <div className="alert alert-error">
              {displayError}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Create a password (min 6 characters)"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirm your password"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading || !!successMessage}
            className="btn btn-primary login-submit-btn"
          >
            {isSubmitting ? (
              <div className="loading-text">
                <div className="spinner small-spinner"></div>
                Creating Account...
              </div>
            ) : successMessage ? (
              <div className="loading-text">
                <div className="spinner small-spinner"></div>
                Redirecting...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="login-footer">
            <p>
              Already have a space?{' '}
              <Link to="/login" className="login-link">
                Welcome back
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
