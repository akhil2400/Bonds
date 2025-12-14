import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Login.css'; // Reusing login styles

const Signup = () => {
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification, 3: Success
  const [verificationMethod, setVerificationMethod] = useState('email'); // 'email' or 'mobile'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [otpData, setOtpData] = useState({
    otp: '',
    isVerifying: false,
    canResend: false,
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
    setOtpData(prev => ({ ...prev, canResend: false, resendTimer: 60 }));
    const timer = setInterval(() => {
      setOtpData(prev => {
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

      // Step 1: Send OTP
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Signup initiated successfully:', response);
      
      // Show preview URL for development
      if (response.previewUrl) {
        console.log('🎯 Test email preview:', response.previewUrl);
        alert(`Development Mode: Check console for email preview link, or click here: ${response.previewUrl}`);
      }
      
      setStep(2);
      startResendTimer();
    } catch (err) {
      console.error('Signup failed:', err);
      setValidationError(err.message || 'Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpData.otp || otpData.otp.length !== 6) {
      setValidationError('Please enter a valid 6-digit verification code');
      return;
    }

    setOtpData(prev => ({ ...prev, isVerifying: true }));

    try {
      // Step 2: Verify OTP and create account
      const response = await authService.verifyOTP({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otpData.otp
      });

      // Update auth context with new user
      await register(response.user);
      
      // Redirect will happen automatically via AuthContext
    } catch (err) {
      console.error('OTP verification failed:', err);
      setValidationError(err.message || 'Invalid verification code');
    } finally {
      setOtpData(prev => ({ ...prev, isVerifying: false }));
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.resendOTP({
        email: formData.email,
        name: formData.name
      });
      startResendTimer();
      setValidationError('');
    } catch (err) {
      setValidationError(err.message || 'Failed to resend verification code');
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
        <label className="form-label">Verification Method</label>
        <div className="verification-method-selector">
          <label className="radio-option">
            <input
              type="radio"
              name="verificationMethod"
              value="email"
              checked={verificationMethod === 'email'}
              onChange={(e) => setVerificationMethod(e.target.value)}
            />
            <span>Email Verification</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="verificationMethod"
              value="mobile"
              checked={verificationMethod === 'mobile'}
              onChange={(e) => setVerificationMethod(e.target.value)}
            />
            <span>SMS Verification</span>
          </label>
        </div>
      </div>

      {verificationMethod === 'email' && (
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
      )}

      {verificationMethod === 'mobile' && (
        <div className="form-group">
          <label htmlFor="mobile" className="form-label">
            Mobile Number
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            required
            value={formData.mobile}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your mobile number"
          />
        </div>
      )}

      {verificationMethod === 'mobile' && (
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address (optional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your email (optional)"
          />
        </div>
      )}

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
            Sending OTP...
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

  // Step 2: OTP Verification
  const renderOTPVerification = () => (
    <form className="login-form" onSubmit={handleOTPSubmit}>
      {displayError && (
        <div className="alert alert-error">
          {displayError}
        </div>
      )}

      <div className="otp-info">
        <p>
          We've sent a 6-digit verification code to your{' '}
          {verificationMethod === 'email' ? 'email' : 'mobile number'}:
        </p>
        <strong>
          {verificationMethod === 'email' ? formData.email : formData.mobile}
        </strong>
      </div>

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
          value={otpData.otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setOtpData(prev => ({ ...prev, otp: value }));
            if (validationError) setValidationError('');
          }}
          className="form-input otp-input"
          placeholder="Enter 6-digit code"
        />
      </div>

      <button
        type="submit"
        disabled={otpData.isVerifying || loading}
        className="btn btn-primary login-submit-btn"
      >
        {otpData.isVerifying ? (
          <div className="loading-text">
            <div className="spinner small-spinner"></div>
            Verifying...
          </div>
        ) : (
          'Complete setup'
        )}
      </button>

      <div className="otp-actions">
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={!otpData.canResend}
          className="btn btn-link"
        >
          {otpData.canResend ? 'Resend Code' : `Resend in ${otpData.resendTimer}s`}
        </button>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="btn btn-link"
        >
          Change Details
        </button>
      </div>
    </form>
  );

  return (
    <div className="login-container page-enter">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>
            {step === 1 ? 'Create your space' : 'Almost there'}
          </h2>
          <p>
            {step === 1 
              ? 'A quiet place for your friendship memories'
              : 'Please verify to complete your journey'
            }
          </p>
        </div>

        {step === 1 && renderRegistrationForm()}
        {step === 2 && renderOTPVerification()}
      </div>
    </div>
  );
};

export default Signup;