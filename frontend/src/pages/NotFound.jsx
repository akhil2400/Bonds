import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NotFound.css';

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="not-found-container">
      {/* Background Pattern */}
      <div className="not-found-background">
        <div className="floating-memories">
          <div className="memory-bubble memory-1"></div>
          <div className="memory-bubble memory-2"></div>
          <div className="memory-bubble memory-3"></div>
          <div className="memory-bubble memory-4"></div>
          <div className="memory-bubble memory-5"></div>
          <div className="memory-bubble memory-6"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="not-found-content">
        <div className="not-found-header">
          <div className="error-code">404</div>
          <div className="error-title">Oops! This Memory Doesn't Exist</div>
          <div className="error-subtitle">
            Looks like this page got lost in our friendship journey
          </div>
        </div>

        <div className="not-found-illustration">
          <div className="broken-heart">
            <div className="heart-piece heart-left"></div>
            <div className="heart-piece heart-right"></div>
          </div>
          <div className="search-glass"></div>
        </div>

        <div className="not-found-message">
          <p>
            Don't worry! Even the best friendships have moments when we can't find what we're looking for. 
            Let's get you back to creating beautiful memories together.
          </p>
        </div>

        <div className="not-found-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-primary btn-home">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Back to Dashboard</span>
              </Link>
              <Link to="/memories" className="btn btn-secondary btn-memories">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>View Memories</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="btn btn-primary btn-home">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Back to Home</span>
              </Link>
              <Link to="/login" className="btn btn-secondary btn-login">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 01-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        <div className="not-found-suggestions">
          <h3>Popular Destinations</h3>
          <div className="suggestion-links">
            {isAuthenticated ? (
              <>
                <Link to="/timeline" className="suggestion-link">
                  <span className="suggestion-icon"></span>
                  <span>Timeline</span>
                </Link>
                <Link to="/thoughts" className="suggestion-link">
                  <span className="suggestion-icon"></span>
                  <span>Thoughts</span>
                </Link>
                <Link to="/trips" className="suggestion-link">
                  <span className="suggestion-icon"></span>
                  <span>Trips</span>
                </Link>
                <Link to="/music" className="suggestion-link">
                  <span className="suggestion-icon"></span>
                  <span>Music</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="suggestion-link">
                  <span className="suggestion-icon"></span>
                  <span>Join BONDS</span>
                </Link>
                <Link to="/login" className="suggestion-link">
                  <span className="suggestion-icon"></span>
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="not-found-footer">
          <p>
            <span className="brand-name">BONDS</span> - Where friendships live forever
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;