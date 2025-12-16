import React from 'react';

const TestNotFound = () => {
  console.log('TestNotFound component rendered');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      background: '#f0f0f0'
    }}>
      <h1 style={{ color: '#333', fontSize: '3rem' }}>404</h1>
      <p style={{ color: '#666', fontSize: '1.2rem' }}>Test 404 Page - This should work!</p>
      <p style={{ color: '#999' }}>Current URL: {window.location.pathname}</p>
    </div>
  );
};

export default TestNotFound;