import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">💔</div>
            <h1 className="error-title">Oops! Something went wrong</h1>
            <p className="error-message">
              Don't worry, even the strongest friendships face challenges. 
              Let's get you back on track!
            </p>
            
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                🔄 Try Again
              </button>
              <Link to="/" className="btn btn-secondary">
                🏠 Go Home
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-footer">
              <span className="brand-name">BONDS</span> - Where friendships live forever
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;