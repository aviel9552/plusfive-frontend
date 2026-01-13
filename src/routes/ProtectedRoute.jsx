import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import PublicRoutes from './publicRoutes';
import { logoutUser } from '../redux/actions/authActions';

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const location = useLocation();

  // Helper function to check if JWT token is expired or missing
  const checkTokenValidity = () => {
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
  };

  // Check token validity on component mount and when authentication state changes
  useEffect(() => {
    const tokenCheck = checkTokenValidity();
    
    // If token is missing or expired, logout user and redirect
    if (!tokenCheck.isValid) {
      dispatch(logoutUser());
    }
  }, [dispatch, isAuthenticated]);

  // If token is invalid (missing or expired), redirect to login
  const tokenValidity = checkTokenValidity();
if (!tokenValidity.isValid) {
  return <Navigate to="/login" replace />;
}

  const token = localStorage.getItem('token');
const isAppRoute = location.pathname.startsWith('/app');

// ✅ אם אנחנו כבר על /app ויש טוקן, אבל Redux עוד לא הספיק להתעדכן — תציג Loader במקום דף לבן
if (!isAuthenticated) {
  if (isAppRoute && token && token !== 'undefined' && token.trim() !== '') {
    return <div className="p-6">Loading...</div>;
  }

  // לא מחובר באמת -> לך ללוגין
  return <Navigate to="/login" replace state={{ from: location }} />;
}

// ✅ מונע מסך לבן אחרי login בזמן שה-user עוד נטען
if (isAuthenticated && !user) {
  return <div className="p-6">Loading...</div>;
}

  // User is authenticated - allow access to all routes
  // Subscription checks are handled at API level (backend controllers)
  // and UI level (buttons disabled) - no need to block routes here
  return children;
}

export default ProtectedRoute; 
