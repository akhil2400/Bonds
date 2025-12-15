import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const { isTrustedMember, getUserRole } = usePermissions();

  const quickActions = [
    {
      title: 'Memories',
      description: isTrustedMember() ? 'Precious moments captured in time' : 'View precious moments captured in time',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      link: '/memories',
      color: 'blue'
    },
    {
      title: 'Timeline',
      description: isTrustedMember() ? 'The journey of our friendship through the years' : 'Follow the journey of our friendship through the years',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      link: '/timeline',
      color: 'green'
    },
    {
      title: 'Thoughts',
      description: isTrustedMember() ? 'Personal reflections and musings' : 'Read personal reflections and musings',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      ),
      link: '/thoughts',
      color: 'purple'
    },
    {
      title: 'Trips',
      description: isTrustedMember() ? 'Adventures and travel plans' : 'Discover adventures and travel plans',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      link: '/trips',
      color: 'orange'
    },
    {
      title: 'Music',
      description: isTrustedMember() ? 'Songs that soundtrack our friendship' : 'Listen to songs that soundtrack our friendship',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
        </svg>
      ),
      link: '/music',
      color: 'pink'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="welcome-badge">
            <span className="badge-text">Welcome back</span>
          </div>
          <h1 className="hero-title">
            Hello, <span className="highlight">{user?.name}</span>
          </h1>
          <p className="hero-subtitle">
            {isTrustedMember() 
              ? 'Your sacred space to preserve the moments that matter most'
              : 'Welcome to our friendship sanctuary - witness the beautiful bonds we share'
            }
          </p>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <Link 
              key={index} 
              to={action.link} 
              className={`action-card ${action.color}`}
            >
              <div className="action-icon">
                {action.icon}
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="story-section">
        <div className="story-grid">
          <div className="story-card main-story">
            <div className="story-icon">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Our Sacred Space</h2>
            <p>
              {isTrustedMember() 
                ? 'This is our digital sanctuary where the four of us preserve the moments that matter. Every laugh, every adventure, every quiet conversation that shaped our friendship lives here.'
                : 'Welcome to our digital sanctuary - a place where authentic friendship is celebrated and shared. Here, you can witness the beautiful bonds that connect four hearts as one.'
              }
            </p>
          </div>

          <div className="story-card">
            <div className="story-icon">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            </div>
            <h3>Infinite Memories</h3>
            <p>
              {isTrustedMember()
                ? 'Four friends, countless moments, infinite possibilities for creating lasting memories together.'
                : 'Witness the power of true friendship through shared memories, adventures, and heartfelt moments.'
              }
            </p>
          </div>

          <div className="story-card">
            <div className="story-icon">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>
              {isTrustedMember() ? 'Your Role' : 'Your Experience'}
            </h3>
            <p>
              {isTrustedMember()
                ? 'As a trusted member, you can create, share, and manage content. Help build this beautiful collection of memories.'
                : 'As a viewer, you get to experience the authentic beauty of friendship. Enjoy the journey through our shared moments.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="quote-section">
        <div className="quote-content">
          <div className="quote-mark">"</div>
          <blockquote>
            {isTrustedMember()
              ? 'In a world that moves too fast, we\'ve created this space to slow down and remember what truly matters - the bonds we\'ve built and the memories we continue to create together.'
              : 'True friendship is a gift that keeps on giving. Thank you for being part of our journey and witnessing the beauty of authentic connections.'
            }
          </blockquote>
          <div className="quote-author">— The Bonds Family</div>
        </div>
      </div>
    </div>
  );
};

export default Home;