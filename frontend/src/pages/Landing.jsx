import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-container page-enter">
      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      <div className="landing-content">
        {/* Elegant Header */}
        <header className="landing-header">
          <div className="logo-container">
            <div className="logo">
              <h1 className="brand-name">Bonds</h1>
              <div className="brand-ornament"></div>
              <p className="logo-subtitle">Where friendships live forever</p>
            </div>
          </div>
          {isAuthenticated && (
            <div className="auth-nav">
              <Link to="/dashboard" className="btn btn-secondary btn-small">
                <span>Go to Dashboard</span>
                <div className="btn-shine"></div>
              </Link>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <main className="landing-main">
          <div className="hero-section">
            <div className="hero-content">
              <div className="hero-badge">
                <span>✨ Celebrate Friendship</span>
              </div>
              
              <h2 className="hero-title">
                <span className="title-line">Treasure every</span>
                <span className="title-line hero-highlight">beautiful moment</span>
                <span className="title-line">with your dearest friends</span>
              </h2>
              
              <p className="hero-description">
                Create an intimate sanctuary for your most precious memories. Share inside jokes, 
                capture adventures, and weave together the golden threads that make your 
                friendships extraordinary and timeless.
              </p>

              <div className="cta-section">
                <Link to="/signup" className="btn btn-primary btn-elegant">
                  <span>Begin Your Journey</span>
                  <div className="btn-glow"></div>
                </Link>
                <Link to="/login" className="btn btn-secondary btn-elegant">
                  <span>Welcome Back</span>
                  <div className="btn-shine"></div>
                </Link>
              </div>

              <div className="trust-indicators">
                <div className="trust-item">
                  <span className="trust-icon">🔒</span>
                  <span>Private & Secure</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">💝</span>
                  <span>Made with Love</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">✨</span>
                  <span>Forever Free</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="memory-showcase">
                <div className="showcase-background"></div>
                <div className="memory-grid">
                  <div className="memory-card card-large">
                    <div className="card-glow"></div>
                    <div className="memory-icon">✨</div>
                    <h4>Precious Memories</h4>
                    <p>Capture life's beautiful moments</p>
                  </div>
                  <div className="memory-card card-medium">
                    <div className="card-glow"></div>
                    <div className="memory-icon">🎵</div>
                    <h4>Shared Playlists</h4>
                    <p>Music that binds hearts</p>
                  </div>
                  <div className="memory-card card-medium">
                    <div className="card-glow"></div>
                    <div className="memory-icon">💭</div>
                    <h4>Deep Thoughts</h4>
                    <p>Conversations that matter</p>
                  </div>
                  <div className="memory-card card-small">
                    <div className="card-glow"></div>
                    <div className="memory-icon">🌍</div>
                    <h4>Adventures</h4>
                  </div>
                  <div className="memory-card card-small">
                    <div className="card-glow"></div>
                    <div className="memory-icon">📸</div>
                    <h4>Photos</h4>
                  </div>
                  <div className="memory-card card-small">
                    <div className="card-glow"></div>
                    <div className="memory-icon">💌</div>
                    <h4>Letters</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Elegant Features */}
          <section className="features-section">
            <div className="features-header">
              <h3 className="section-title">Why Choose Bonds?</h3>
              <p className="section-subtitle">Everything you need to celebrate friendship</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <span>🏛️</span>
                </div>
                <h4>Your Friendship Sanctuary</h4>
                <p>A sacred, private space where your most treasured memories remain safe between you and your closest companions.</p>
                <div className="feature-accent"></div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <span>🎨</span>
                </div>
                <h4>Celebrate Every Moment</h4>
                <p>From spontaneous laughter to profound conversations—capture the entire beautiful spectrum of your friendship journey.</p>
                <div className="feature-accent"></div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <span>🤝</span>
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
                  <div className="author-avatar">👥</div>
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