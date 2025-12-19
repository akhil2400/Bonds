import { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Login.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1); // 1: Verifying token, 2: Reset form, 3: Success
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [verificationState, setVerificationState] = useState({
    isVerifying: true,
    isValid: false,
    email: '',
    error: null
  });
  const [resetState, setResetState] = useState({
    isResetting: false,
    success: false,
    error: null
  });
  const [validationError, setValidationError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setVerificationState({
        isVerifying: false,
        isValid: false,
        email: '',
        error: 'Invalid reset link'
      });
      return;
    }

    verifyResetToken();
  }, [token]);

  const verifyResetToken = async () => {
    try {
      setVerificationState(prev => ({ ...prev, isVerifying: true }));

      console.log('Verifying reset token:', token);
      
      const response = await authService.verifyResetLink(token);
      
      console.log('Reset token verification successful:', response);

      setVerificationState({
        isVerifying: false,
        isValid: true,
        email: response.email,
        error: null
      });

      setStep(2);

    } catch (error) {
      console.error('Reset token verification failed:', error);
      
      setVerificationState({
        isVerifying: false,
        isValid: false,
        email: '',
        error: error.message || 'Invalid or expired reset link'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    setResetState({ isResetting: true, success: false, error: null });

    try {
      console.log('Resetting password with token:', token);
      
      const response = await authService.resetPassword(token, formData.newPassword);
      
      console.log('Password reset successful:', response);

      setResetState({
        isResetting: false,
        success: true,
        error: null
      });

      setStep(3);

    } catch (error) {
      console.error('Password reset failed:', error);
      
      setResetState({
        isResetting: false,
        success: false,
        error: error.message || 'Failed to reset password'
      });
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const renderVerifyingToken = () => (
    <div className="verification-status verifying">
      <div className="verification-icon">
        <div className="spinner"></div>
      </div>
      <h3>Verifying reset link...</h3>
      <p>Please wait while we verify your password reset link.</p>
    </div>
  );

  const renderResetForm = () => (
    <form className="login-form" onSubmit={handleSubmit}>
      {(resetState.error || validationError) && (
        <div className="alert alert-error">
          {resetState.error || validationError}
        </div>
      )}

      <div className="reset-info">
        <p>
          Create a new password for your account:
        </p>
        <strong className="email-display">
          {verificationState.email}
        </strong>
      </div>

      <div className="form-group">
        <label htmlFor="newPassword" className="form-label">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          value={formData.newPassword}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter new password (min 6 characters)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="form-input"
          placeholder="Confirm your new password"
        />
      </div>

      <button
        type="submit"
        disabled={resetState.isResetting}
        className="btn btn-primary login-submit-btn"
      >
        {resetState.isResetting ? (
          <div className="loading-text">
            <div className="spinner small-spinner"></div>
            Resetting Password...
          </div>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  );

  const renderSuccess = () => (
    <div className="verification-status success">
      <div className="verification-icon">
        ✅
      </div>
      <h3>Password Reset Successful!</h3>
      <p>Your password has been updated successfully.</p>
      <div className="verification-actions">
        <a href="/login" className="btn btn-primary">
          Sign In Now
        </a>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="verification-status error">
      <div className="verification-icon">
        ❌
      </div>
      <h3>Invalid Reset Link</h3>
      <p>{verificationState.error}</p>
      <div className="verification-actions">
        <a href="/forgot-password" className="btn btn-primary">
          Request New Link
        </a>
        <a href="/login" className="btn btn-secondary">
          Back to Sign In
        </a>
      </div>
    </div>
  );

  const getHeaderText = () => {
    switch (step) {
      case 1:
        return 'Verifying Reset Link';
      case 2:
        return 'Reset Your Password';
      case 3:
        return 'Password Reset Complete';
      default:
        return 'Password Reset';
    }
  };

  const getSubtitleText = () => {
    switch (step) {
      case 1:
        return 'Please wait while we verify your link';
      case 2:
        return 'Choose a new secure password';
      case 3:
        return 'You can now sign in with your new password';
      default:
        return 'Reset your BONDS password';
    }
  };

  return (
    <div className="login-container page-enter">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>{getHeaderText()}</h2>
          <p>{getSubtitleText()}</p>
        </div>

        {step === 1 && verificationState.isVerifying && renderVerifyingToken()}
        {step === 1 && !verificationState.isVerifying && !verificationState.isValid && renderError()}
        {step === 2 && renderResetForm()}
        {step === 3 && renderSuccess()}
      </div>
    </div>
  );
};

export default ResetPassword;