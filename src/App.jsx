import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import UserRoutes from './routes/userRoutes';
import AdminRoutes from './routes/adminRoutes';
import ProtectedRoute from './routes/ProtectedRoute';
import CommonToastify from './components/commonComponent/CommonToastify';
import PublicRoutes from './routes/publicRoutes';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout } from './components';
// import './App.css'

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    // If user is authenticated and is on the root path, redirect to the correct dashboard based on their role
    if (isAuthenticated) {
      if (location.pathname === '/') {
        if (user && user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/app', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, location, navigate]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <CommonToastify />
        <Routes>
          {/* Public routes (no layout) */}
          <Route path="/*" element={<PublicRoutes />} />

          {/* User protected routes (with layout) */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <Layout>
                <UserRoutes />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin protected routes (with layout) */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <Layout>
                <AdminRoutes />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
