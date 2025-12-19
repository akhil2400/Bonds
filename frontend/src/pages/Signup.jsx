import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Login.css'; // Reusing login styles

const Signup = () => {
  const { isAuthenticated, loading, error, clearError } = useAuth();
  const [step, setStep] = useState(1); // 1: Form, 2: Magic Link Sent
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [magicLinkData, setMagicLinkData] = useState({
    email: '',
    expiresAt: null,
    isResending: false,
    canResend: true,
    resendTimer: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

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
  };

  // Start resend timer
  const startResendTimer = () => {
    setMagicLinkData(prev => ({ ...prev, canResend: false, resendTimer: 60 }));
    const timer = setInterval(() => {
      setMagicLinkData(prev => {
        if (prev.resendTimer <= 1) {
          clearInterval(timer);
          return { ...prev, canResend: true, resendTimer: 0 };
        }
        return { ...prev, resendTimer: prev.resendTimer - 1 };
      });
    }, 1000);
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
        email: formData.email,
        password: formData.password
      });

      // Step 1: Send Magic Link
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Signup initiated successfully:', response);
      
      setMagicLinkData({
        email: formData.email,
        expiresAt: response.expiresAt,
        isResending: false,
        canResend: true,
        resendTimer: 0
      });
      
      setStep(2);
      startResendTimer();
    } catch (err) {
      console.error('Signup failed:', err);
      setValidationError(err.message || 'Failed to send verification link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendMagicLink = async () => {
    setMagicLinkData(prev => ({ ...prev, isResending: true }));
    
    try {
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Magic link resent successfully:', response);
      
      setMagicLinkData(prev => ({
        ...prev,
        expiresAt: response.expiresAt,
        isResending: false
      }));
      
      startResendTimer();
      setValidationError('');
    } catch (err) {
      console.error('Failed to resend magic link:', err);
      setValidationError(err.message || 'Failed to resend verification link');
      setMagicLinkData(prev => ({ ...prev, isResending: false }));
    }
  };

  const displayError = error || validationError;

  // Step 1: Registration Form
  const renderRegistrationForm = () => (
    <form className="login-form" onSubmit={handleSubmit}>
      {displayError && (
        <div className="alert alert-error">
          {displayError}
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
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="btn btn-primary login-submit-btn"
      >
        {isSubmitting ? (
          <div className="loading-text">
            <div className="spinner small-spinner"></div>
            Sending Magic Link...
          </div>
        ) : (
          'Continue'
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
  );

  // Step 2: Magic Link Sent
  const renderMagicLinkSent = () => (
    <div className="login-form">
      {displayError && (
        <div className="alert alert-error">
          {displayError}
        </div>
      )}

      <div className="magic-link-info">
        <div className="magic-link-icon">
          ✨
        </div>
        <h3>Check your email!</h3>
        <p>
          We've sent a verification link to:
        </p>
        <strong className="email-display">
          {magicLinkData.email}
        </strong>
        <p className="magic-link-instructions">
          Click the link in your email to complete your registration. 
          The link will expire in 10 minutes for your security.
        </p>
      </div>

      <div className="magic-link-actions">
        <button
          type="button"
          onClick={handleResendMagicLink}
          disabled={!magicLinkData.canResend || magicLinkData.isResending}
          className="btn btn-secondary"
        >
          {magicLinkData.isResending ? (
            <div className="loading-text">
              <div className="spinner small-spinner"></div>
              Sending...
            </div>
          ) : magicLinkData.canResend ? (
            'Resend Link'
          ) : (
            `Resend in ${magicLinkData.resendTimer}s`
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setStep(1)}
          className="btn btn-link"
        >
          Change Details
        </button>
      </div>

      <div className="magic-link-help">
        <p>
          <strong>Didn't receive the email?</strong>
        </p>
        <ul>
          <li>Check your spam/junk folder</li>
          <li>Make sure you entered the correct email address</li>
          <li>Wait a few minutes and try resending</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="login-container page-enter">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>
            {step === 1 ? 'Create your space' : 'Magic link sent!'}
          </h2>
          <p>
            {step === 1 
              ? 'A quiet place for your friendship memories'
              : 'Check your email to complete registration'
            }
          </p>
        </div>

        {step === 1 && renderRegistrationForm()}
        {step === 2 && renderMagicLinkSent()}
      </div>
    </div>
  );
};

export default Signup;