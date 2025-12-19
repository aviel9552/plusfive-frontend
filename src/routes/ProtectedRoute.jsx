import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import PublicRoutes from './publicRoutes';
import { logoutUser } from '../redux/actions/authActions';
import { useStripeSubscription } from '../hooks/useStripeSubscription';

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const location = useLocation();
  const slug = window.location.pathname.split('/')[1];
  
  // Get Stripe subscription data
  const { subscriptionLoading, currentSubscription } = useStripeSubscription(slug);

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

// ✅ מונע מסך לבן אחרי login בזמן שה-user עוד נטען
if (isAuthenticated && !user) {
  return <div className="p-6">Loading...</div>;
}


  // Helper function to check if user has active subscription from Stripe API
  const hasActiveSubscription = () => {
    // Admin users don't need subscription
    if (user?.role === 'admin') {
      return true;
    }

    // FIRST: Check Stripe API response (most reliable source - PRIMARY CHECK)
    if (!subscriptionLoading && currentSubscription?.data?.stripe) {
      const subscriptions = currentSubscription.data.stripe.subscriptions;
      
      // If Stripe API has been loaded and subscriptions array exists (even if empty)
      // This means we got a response from Stripe API
      if (Array.isArray(subscriptions)) {
        // Filter for active subscriptions
        const activeSubscriptions = subscriptions.filter(
          sub => sub.status && ['active', 'trialing'].includes(sub.status.toLowerCase())
        );
        
        if (activeSubscriptions.length > 0) {
          // Check if subscription is not expired
          const subscription = activeSubscriptions[0];
          if (subscription.current_period_end) {
            const expiryTimestamp = subscription.current_period_end * 1000; // Convert to milliseconds
            const now = Date.now();
            if (expiryTimestamp > now) {
              return true; // Active and not expired
            }
          } else {
            return true; // Active with no expiry date
          }
        }
        
        // If subscriptions array is empty, user has NO subscription in Stripe
        // Return false immediately - don't check Redux fallback
        return false;
      }
    }

    // SECOND: Check user data from Redux (fallback ONLY if Stripe API hasn't loaded yet)
    // Only use this if subscription is still loading or Stripe API call failed
    if (subscriptionLoading) {
      // Still loading - can't make decision yet, return false to be safe
      return false;
    }

    // If we reach here, Stripe API has loaded but we didn't get expected response
    // Return false - no active subscription
    return false;
  };

  // Check if current route is subscription page
  const isSubscriptionRoute = location.pathname === '/subscription' || location.pathname.startsWith('/subscription/');
  
  // If user is authenticated and doesn't have subscription, redirect to subscription page IMMEDIATELY
  if (isAuthenticated && user && user.role !== 'admin') {
    // Check if subscription data has loaded
    if (!subscriptionLoading && currentSubscription?.data?.stripe) {
      // Stripe API response received - check subscription status
      if (!hasActiveSubscription() && !isSubscriptionRoute) {
        // No active subscription - redirect immediately to /subscription
        return <Navigate to="/subscription" replace />;
      }
    }
  }

  // Check if route is /app/* and requires subscription
  const isAppRoute = location.pathname.startsWith('/app');
  
  // If accessing /app/* routes, check subscription - redirect immediately if no subscription
  if (isAppRoute && user?.role !== 'admin') {
    if (!subscriptionLoading && currentSubscription?.data?.stripe) {
      if (!hasActiveSubscription()) {
        // No active subscription, redirect immediately to subscription page
        return <Navigate to="/subscription" replace />;
      }
    }
  }

  // If user is authenticated and has subscription (or is admin), render the protected content
  return children;
}

export default ProtectedRoute; 
