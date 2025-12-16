import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FriendshipCounter from '../components/common/FriendshipCounter';
import './Landing.css';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-container page-enter">
      {/* Hero Cover Section with Group Photo */}
      <section className="hero-cover-section">
        <div className="hero-cover-image">
          <img
            src="/us.jpeg"
            alt="Our friendship journey - 12 years of memories"
            className="cover-photo"
            loading="eager"
          />
          <div className="hero-overlay"></div>
        </div>

        {/* Navigation Header */}
        <header className="hero-header">
          {isAuthenticated && (
            <div className="auth-nav">
              <Link to="/dashboard" className="btn btn-glass">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Go to Dashboard</span>
              </Link>
            </div>
          )}
        </header>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-text">
            <FriendshipCounter />

            <h1 className="hero-title">
              <span className="brand-name">BONDS</span>
            </h1>

            <p className="hero-tagline">Where friendships live forever</p>

            <p className="hero-subtitle" style={{ color: "#ffffff" }}>
              12 years of memories, laughter, and togetherness
            </p>

            <div className="cta-section">
              <Link to="/signup" className="btn btn-primary btn-hero">
                <span>Explore Our Journey</span>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/login" className="btn btn-glass btn-hero">
                <span>Welcome Back</span>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 01-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator" onClick={() => {
          document.querySelector('.landing-content')?.scrollIntoView({
            behavior: 'smooth'
          });
        }}>
          <div className="scroll-arrow">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="landing-content">
        <main className="landing-main">

          {/* Elegant Features */}
          <section className="features-section">
            <div className="features-header">
              <h3 className="section-title">Why Choose Bonds?</h3>
              <p className="section-subtitle">Everything you need to celebrate friendship</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4>Your Friendship Sanctuary</h4>
                <p>A sacred, private space where your most treasured memories remain safe between you and your closest companions.</p>
                <div className="feature-accent"></div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h4>Celebrate Every Moment</h4>
                <p>From spontaneous laughter to profound conversations—capture the entire beautiful spectrum of your friendship journey.</p>
                <div className="feature-accent"></div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h4>Built for Togetherness</h4>
                <p>Share curated playlists, plan unforgettable adventures, and create a living timeline of your friendship's evolution.</p>
                <div className="feature-accent"></div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="testimonial-section">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "Bonds has transformed how we celebrate our friendship. It's like having a beautiful scrapbook that grows with us."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <div className="author-info">
                    <span className="author-name">Sarah & Emma</span>
                    <span className="author-title">Best Friends Since 2010</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-glow"></div>
            </div>
          </section>
        </main>

        {/* Elegant Footer */}
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <h4>Bonds</h4>
              <p>Celebrating friendships, one memory at a time</p>
            </div>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#support">Support</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Made with 💝 for friendships that last a lifetime</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;