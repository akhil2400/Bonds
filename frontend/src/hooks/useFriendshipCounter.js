import { useState, useEffect } from 'react';

// Set your friendship start date here (adjust as needed)
const FRIENDSHIP_START_DATE = new Date('2013-12-16'); // December 16, 2013

export const useFriendshipCounter = () => {
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0
  });

  useEffect(() => {
    const calculateTimeElapsed = () => {
      const now = new Date();
      const diffInMs = now - FRIENDSHIP_START_DATE;
      
      // Calculate total days
      const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      // Calculate years, months, days
      let years = now.getFullYear() - FRIENDSHIP_START_DATE.getFullYear();
      let months = now.getMonth() - FRIENDSHIP_START_DATE.getMonth();
      let days = now.getDate() - FRIENDSHIP_START_DATE.getDate();
      
      // Adjust for negative values
      if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
      }
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // Calculate hours, minutes, seconds
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      setTimeElapsed({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays
      });
    };

    // Calculate immediately
    calculateTimeElapsed();
    
    // Update every second
    const interval = setInterval(calculateTimeElapsed, 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return timeElapsed;
};

export const formatFriendshipDuration = (timeElapsed) => {
  const { years, months, days, hours, minutes, seconds } = timeElapsed;
  
  // Primary display - years and additional info
  let primaryText = '';
  let secondaryText = '';
  
  if (years > 0) {
    primaryText = `${years} Year${years !== 1 ? 's' : ''}`;
    
    if (months > 0 || days > 0) {
      const monthsText = months > 0 ? `${months} Month${months !== 1 ? 's' : ''}` : '';
      const daysText = days > 0 ? `${days} Day${days !== 1 ? 's' : ''}` : '';
      
      if (monthsText && daysText) {
        secondaryText = `${monthsText}, ${daysText}`;
      } else {
        secondaryText = monthsText || daysText;
      }
    }
  } else if (months > 0) {
    primaryText = `${months} Month${months !== 1 ? 's' : ''}`;
    if (days > 0) {
      secondaryText = `${days} Day${days !== 1 ? 's' : ''}`;
    }
  } else {
    primaryText = `${days} Day${days !== 1 ? 's' : ''}`;
  }
  
  // Live time display
  const liveTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return {
    primaryText,
    secondaryText,
    liveTime,
    totalDays: timeElapsed.totalDays
  };
};