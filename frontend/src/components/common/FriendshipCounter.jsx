import { useFriendshipCounter, formatFriendshipDuration } from '../../hooks/useFriendshipCounter';
import './FriendshipCounter.css';

const FriendshipCounter = ({ className = '' }) => {
  const timeElapsed = useFriendshipCounter();
  const { primaryText, secondaryText, liveTime, totalDays } = formatFriendshipDuration(timeElapsed);

  return (
    <div className={`friendship-counter ${className}`}>
      <div className="counter-icon">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      </div>
      
      <div className="counter-content">
        <div className="counter-primary">
          <span className="primary-text">{primaryText}</span>
          <span className="friendship-text">of Friendship</span>
        </div>
        
        {secondaryText && (
          <div className="counter-secondary">
            {secondaryText}
          </div>
        )}
        
        <div className="counter-live">
          <div className="live-time">
            <span className="time-display">{liveTime}</span>
            <span className="time-label">Live Time</span>
          </div>
          <div className="total-days">
            <span className="days-count">{totalDays.toLocaleString()}</span>
            <span className="days-label">Total Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendshipCounter;