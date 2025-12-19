import { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Login.css';

const VerifyMagicLink = () => {
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated, loading } = useAuth();
  const [verificationState, setVerificationState] = useState({
    isVerifying: true,
    success: false,
    error: null,
    message: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setVerificationState({
        isVerifying: false,
        success: false,
        error: 'Invalid verification link',
        message: 'The verification link is missing or invalid.'
      });
      return;
    }

    verifyMagicLink();
  }, [token]);

  const verifyMagicLink = async () => {
    try {
      setVerificationState(prev => ({ ...prev, isVerifying: true }));

      console.log('Verifying magic link with token:', token);
      
      const response = await authService.verifyMagicLink(token);
      
      console.log('Magic link verification successful:', response);

      // Update auth context with new user and token
      await register(response.user, response.token);

      setVerificationState({
        isVerifying: false,
        success: true,
        error: null,
        message: response.message || 'Account verified successfully!'
      });

    } catch (error) {
      console.error('Magic link verification failed:', error);
      
      setVerificationState({
        isVerifying: false,
        success: false,
        error: error.message || 'Verification failed',
        message: 'The verification link is invalid, expired, or has already been used.'
      });
    }
  };

  // Redirect if already authenticated (successful verification)
  if (isAuthenticated && verificationState.success) {
    return <Navigate to="/dashboard" replace />;
  }

  const renderVerificationStatus = () => {
    if (verificationState.isVerifying || loading) {
      return (
        <div className="verification-status verifying">
          <div className="verification-icon">
            <div className="spinner"></div>
          </div>
          <h3>Verifying your account...</h3>
          <p>Please wait while we verify your magic link.</p>
        </div>
      );
    }

    if (verificationState.success) {
      return (
        <div className="verification-status success">
          <div className="verification-icon">
            ✅
          </div>
          <h3>Welcome to BONDS!</h3>
          <p>{verificationState.message}</p>
          <p>You'll be redirected to your dashboard in a moment...</p>
        </div>
      );
    }

    return (
      <div className="verification-status error">
        <div className="verification-icon">
          ❌
        </div>
        <h3>Verification Failed</h3>
        <p>{verificationState.message}</p>
        <div className="verification-actions">
          <a href="/signup" className="btn btn-primary">
            Try Again
          </a>
          <a href="/login" className="btn btn-secondary">
            Sign In Instead
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="login-container page-enter">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>Account Verification</h2>
          <p>Completing your BONDS registration</p>
        </div>

        {renderVerificationStatus()}
      </div>
    </div>
  );
};

export default VerifyMagicLink;