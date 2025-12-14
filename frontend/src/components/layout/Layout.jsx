import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/dashboard" className="logo">
              Bonds
            </Link>

            {/* User Info & Logout */}
            <div className="user-section">
              <span className="user-greeting">
                Hello, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <div className="container">
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/memories" className="nav-link">
              Memories
            </Link>
            <Link to="/timeline" className="nav-link">
              Timeline
            </Link>
            <Link to="/thoughts" className="nav-link">
              Thoughts
            </Link>
            <Link to="/trips" className="nav-link">
              Trips
            </Link>
            <Link to="/music" className="nav-link">
              Music
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;