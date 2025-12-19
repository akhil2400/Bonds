import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Magic Link Sent
  const [formData, setFormData] = useState({
    email: ''
  });
  const [magicLinkData, setMagicLinkData] = useState({
    isResending: false,
    canResend: true,
    resendTimer: 0,
    expiresAt: null
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

  // Step 1: Send reset Magic Link
  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await authService.forgotPassword(formData.email);
      setMaskedEmail(response.email);
      setMagicLinkData({
        isResending: false,
        canResend: true,
        resendTimer: 0,
        expiresAt: response.expiresAt
      });
      setSuccess('Reset link sent to your email!');
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend Magic Link
  const handleResendMagicLink = async () => {
    setMagicLinkData(prev => ({ ...prev, isResending: true }));
    setError('');

    try {
      const response = await authService.forgotPassword(formData.email);
      setMagicLinkData(prev => ({
        ...prev,
        isResending: false,
        expiresAt: response.expiresAt
      }));
      setSuccess('Reset link sent again!');
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Failed to resend reset link');
      setMagicLinkData(prev => ({ ...prev, isResending: false }));
    }
  };

  const renderStep1 = () => (
    <form className="login-form" onSubmit={handleSendMagicLink}>
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
            Sending reset link...
          </div>
        ) : (
          'Send Reset Link'
        )}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <div className="login-form">
      <div className="magic-link-info">
        <div className="magic-link-icon">
          🔑
        </div>
        <h3>Check your email!</h3>
        <p>
          We've sent a password reset link to:
        </p>
        <strong className="email-display">
          {maskedEmail}
        </strong>
        <p className="magic-link-instructions">
          Click the link in your email to reset your password. 
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
          Change Email
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

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Reset your password';
      case 2: return 'Reset link sent!';
      default: return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Enter your email to receive a reset link';
      case 2: return 'Check your email to reset your password';
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