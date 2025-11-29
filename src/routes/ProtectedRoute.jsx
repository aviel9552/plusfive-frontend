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
    // Token is missing or expired - logout and redirect
    if (isAuthenticated) {
      dispatch(logoutUser());
    }
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    // If user is not authenticated, render all public routes (login, register, etc.)
    return <PublicRoutes />;
  }

  // Helper function to check if user has active subscription
  const hasActiveSubscription = () => {
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
      const subscriptionStatus = user?.subscriptionStatus;
      
      // If subscription status is null, undefined, or empty, deny access
      if (!subscriptionStatus || subscriptionStatus.trim() === '') {
        return false;
      }
      
      // Convert to lowercase for comparison
      const status = subscriptionStatus.toLowerCase();
      const expirationDate = user?.subscriptionExpirationDate;
      
      // Only allow if subscription status is explicitly 'active'
      // Reject 'pending', 'canceled', 'inactive', null, undefined, etc.
      if (status === 'active') {
        if (expirationDate) {
          const expiryDate = new Date(expirationDate);
          const now = new Date();
          return expiryDate.getTime() > now.getTime();
        }
        return true; // Active with no expiry date
      }
      
      // All other statuses (pending, canceled, inactive, etc.) deny access
      return false;
    }

    // No user data means no subscription
    return false;
  };

  // Check if route is /app/* and requires subscription
  const isAppRoute = location.pathname.startsWith('/app');
  
  // If accessing /app/* routes, check subscription
  if (isAppRoute && user?.role !== 'admin') {
    if (!hasActiveSubscription()) {
      // No active subscription, redirect to subscription page
      return <Navigate to="/subscription" replace />;
    }
  }

  // If user is authenticated and has subscription (or is admin), render the protected content
  return children;
}

export default ProtectedRoute; 