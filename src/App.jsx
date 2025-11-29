import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import UserRoutes from './routes/userRoutes';
import AdminRoutes from './routes/adminRoutes';
import ProtectedRoute from './routes/ProtectedRoute';
import CommonToastify from './components/commonComponent/CommonToastify';
import PublicRoutes from './routes/publicRoutes';
import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from './redux/actions/authActions';
import { Layout, PageLoader } from './components';
// import './App.css'

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  // Helper function to check if JWT token is expired or missing
  const checkTokenValidity = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token is missing or invalid
      if (!token || token === 'undefined' || token.trim() === '') {
        return { isValid: false, reason: 'missing' };
      }

      // JWT token has 3 parts: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { isValid: false, reason: 'invalid_format' };
      }

      // Decode base64 payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token has expiration (exp field)
      if (!payload.exp) {
        return { isValid: true }; // No expiration set, consider valid
      }

      // exp is in Unix timestamp (seconds), convert to milliseconds
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      // Token is expired if current time is greater than expiration time
      if (currentTime >= expirationTime) {
        return { isValid: false, reason: 'expired' };
      }

      return { isValid: true };
    } catch (error) {
      // If any error occurs (invalid token, parsing error, etc.), consider invalid
      return { isValid: false, reason: 'invalid' };
    }
  }, []);

  // Check token validity - if invalid, logout user
  useEffect(() => {
    const tokenCheck = checkTokenValidity();
    
    // If token is missing or expired and user is authenticated, logout
    if (!tokenCheck.isValid && isAuthenticated) {
      dispatch(logoutUser());
      navigate('/login', { replace: true });
    }
  }, [checkTokenValidity, isAuthenticated, dispatch, navigate]);

  // Helper function to check if user has active subscription
  const hasActiveSubscription = useCallback(() => {
    // Admin users don't need subscription
    if (user?.role === 'admin') {
      return true;
    }

    // Check localStorage cache first
    try {
      const cachedSub = localStorage.getItem('hasActiveSubscription');
      const cachedExpiry = localStorage.getItem('subscriptionExpiry');
      
      if (cachedSub === 'true' && cachedExpiry) {
        const expiryDate = new Date(cachedExpiry);
        const now = new Date();
        if (expiryDate.getTime() > now.getTime()) {
          return true;
        } else {
          // Expired, remove from cache
          localStorage.removeItem('hasActiveSubscription');
          localStorage.removeItem('subscriptionExpiry');
        }
      }
    } catch (e) {
      // Ignore errors
    }

    // Fallback to user data from Redux
    if (user) {
      const subscriptionStatus = user?.subscriptionStatus?.toLowerCase();
      const expirationDate = user?.subscriptionExpirationDate;
      
      if (subscriptionStatus === 'active') {
        if (expirationDate) {
          const expiryDate = new Date(expirationDate);
          const now = new Date();
          return expiryDate.getTime() > now.getTime();
        }
        return true; // Active with no expiry date
      }
    }

    return false;
  }, [user]);

  useEffect(() => {
    // If user is authenticated and is on the root path, redirect based on role and subscription
    if (isAuthenticated && user) {
      if (location.pathname === '/') {
        // Admin users go directly to admin dashboard
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
          return;
        }

        // Regular users: check subscription first
        if (hasActiveSubscription()) {
          // Has active subscription, redirect to app dashboard
          navigate('/app', { replace: true });
        } else {
          // No active subscription, redirect to subscription page
          navigate('/subscription', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, location, navigate, hasActiveSubscription]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PageLoader minLoadTime={2000}>
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
        </PageLoader>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
