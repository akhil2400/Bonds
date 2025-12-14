import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to Bonds, {user?.name}</h1>
        <p>Your private space to cherish friendship memories</p>
      </div>

      <div className="home-grid">
        <div className="card">
          <h2>Our Story</h2>
          <p>
            This is our sacred space - a digital sanctuary where the four of us can 
            preserve the moments that matter. Every laugh, every adventure, every 
            quiet conversation that shaped our friendship lives here.
          </p>
        </div>

        <div className="card">
          <h2>What's Inside</h2>
          <ul className="feature-list">
            <li>
              <span className="feature-dot blue"></span>
              Memories with photos and stories
            </li>
            <li>
              <span className="feature-dot green"></span>
              Timeline of our journey together
            </li>
            <li>
              <span className="feature-dot purple"></span>
              Personal thoughts and reflections
            </li>
            <li>
              <span className="feature-dot orange"></span>
              Trip plans and adventures
            </li>
            <li>
              <span className="feature-dot pink"></span>
              Music that defines our moments
            </li>
          </ul>
        </div>
      </div>

      <div className="home-footer">
        <h3>Four Friends, Infinite Memories</h3>
        <p>
          In a world that moves too fast, we've created this space to slow down 
          and remember what truly matters - the bonds we've built and the memories 
          we continue to create together.
        </p>
      </div>
    </div>
  );
};

export default Home;