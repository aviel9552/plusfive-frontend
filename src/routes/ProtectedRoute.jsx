import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import PublicRoutes from './publicRoutes';

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const location = useLocation();

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