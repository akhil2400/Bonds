import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const SimpleHome = () => <div style={{padding: '2rem'}}>Home Page</div>;
const Simple404 = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h1 style={{fontSize: '4rem', color: '#ff6b6b'}}>404</h1>
    <p style={{fontSize: '1.5rem', color: '#666'}}>Page Not Found</p>
    <p style={{color: '#999'}}>URL: {window.location.pathname}</p>
  </div>
);

function AppTest() {
  console.log('AppTest rendered');
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="*" element={<Simple404 />} />
      </Routes>
    </Router>
  );
}

export default AppTest;