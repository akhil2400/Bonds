import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Step 1: Send reset OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await authService.forgotPassword(formData.email);
      setMaskedEmail(response.email);
      setSuccess('Reset code sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      await authService.resetPassword(formData.email, formData.otp, formData.newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <form className="login-form" onSubmit={handleSendOTP}>
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
          placeholder="Enter your email address"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary login-submit-btn"
      >
        {isSubmitting ? (
          <div className="loading-text">
            <div className="spinner small-spinner"></div>
            Sending code...
          </div>
        ) : (
          'Send Reset Code'
        )}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form className="login-form" onSubmit={handleResetPassword}>
      <div className="form-group">
        <label htmlFor="otp" className="form-label">
          Verification Code
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          required
          maxLength="6"
          value={formData.otp}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter 6-digit code"
        />
        <small className="form-help">
          Code sent to {maskedEmail}
        </small>
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
          placeholder="Enter new password"
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
          placeholder="Confirm new password"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary login-submit-btn"
      >
        {isSubmitting ? (
          <div className="loading-text">
            <div className="spinner small-spinner"></div>
            Resetting password...
          </div>
        ) : (
          'Reset Password'
        )}
      </button>

      <div className="login-footer">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="btn-link"
        >
          ← Back to email
        </button>
      </div>
    </form>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Reset your password';
      case 2: return 'Enter code and new password';
      default: return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Enter your email to receive a reset code';
      case 2: return 'Enter the code from your email and choose a new password';
      default: return '';
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>{getStepTitle()}</h2>
          <p>{getStepDescription()}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}

        <div className="login-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="login-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;