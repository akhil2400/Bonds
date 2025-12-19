import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
// Import connection test for development
import './utils/connectionTest.js';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VerifyMagicLink from './pages/VerifyMagicLink';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Memories from './pages/Memories';
import Thoughts from './pages/Thoughts';
import Trips from './pages/Trips';
import Music from './pages/Music';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PermissionProvider>
          <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={<VerifyMagicLink />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/timeline" element={
            <ProtectedRoute>
              <Layout>
                <Timeline />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/memories" element={
            <ProtectedRoute>
              <Layout>
                <Memories />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/thoughts" element={
            <ProtectedRoute>
              <Layout>
                <Thoughts />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/trips" element={
            <ProtectedRoute>
              <Layout>
                <Trips />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/music" element={
            <ProtectedRoute>
              <Layout>
                <Music />
              </Layout>
            </ProtectedRoute>
          } />
          {/* 404 Not Found route */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          </Router>
        </PermissionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;