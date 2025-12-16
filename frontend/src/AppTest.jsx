import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const SimpleHome = () => <div style={{padding: '2rem'}}>Home Page</div>;
const Simple404 = () => {
  console.log('Simple404 component rendered!');
  console.log('Current URL:', window.location.href);
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      background: '#f0f8ff'
    }}>
      <h1 style={{fontSize: '4rem', color: '#ff6b6b', marginBottom: '1rem'}}>404 - TEST VERSION</h1>
      <p style={{fontSize: '1.5rem', color: '#666', marginBottom: '1rem'}}>Page Not Found - Cache Busted!</p>
      <p style={{color: '#999', marginBottom: '1rem'}}>URL: {window.location.pathname}</p>
      <p style={{color: '#333', fontSize: '0.9rem'}}>Timestamp: {new Date().toISOString()}</p>
      <div style={{marginTop: '2rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd'}}>
        <p style={{margin: 0, fontSize: '0.8rem', color: '#666'}}>
          If you see this, the 404 route is working! 🎉
        </p>
      </div>
    </div>
  );
};

function AppTest() {
  console.log('AppTest rendered at:', new Date().toISOString());
  console.log('Current location:', window.location.href);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="/test" element={<div style={{padding: '2rem'}}>Test Page Works!</div>} />
        <Route path="*" element={<Simple404 />} />
      </Routes>
    </Router>
  );
}

export default AppTest;