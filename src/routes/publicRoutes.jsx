import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import { RouteLoader } from '../components';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import ThankYou from '../pages/auth/thankYou';
import EmailVerify from '../pages/auth/emailVerify';
import ForgotPassword from '../pages/auth/forgotPassword';
import ResetPassword from '../pages/auth/resetPassword';
import LandingPage from '../pages/landingpage';
import NotFound from '../pages/404';
import ContactSales from '../pages/contactSales';
import ReferralPage from '../pages/referral';
import ReviewPage from '../pages/reviews';
import QRScanHandler from '../pages/qrScan';
import SubscriptionSuccess from '../pages/subscription/Success';
import BillingPage from '../pages/billing';
import UpdatePayment from '../pages/subscription/UpdatePayment';
import DirectMessageSend from '../pages/qrScan/DirectMessageSend';
import PublicSubscription from '../pages/subscriptionAndBilling/publicSubscription';
import { useStripeSubscription } from '../hooks/useStripeSubscription';

// Helper function to check token validity
const checkTokenValidity = () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token || token === 'undefined' || token.trim() === '') {
      return { isValid: false, reason: 'missing' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, reason: 'invalid_format' };
    }

    const payload = JSON.parse(atob(parts[1]));
    
    if (!payload.exp) {
      return { isValid: true };
    }

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();

    if (currentTime >= expirationTime) {
      return { isValid: false, reason: 'expired' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, reason: 'invalid' };
  }
};

// Subscription Route Guard - Only checks token and admin redirect, no subscription check
// Subscription check is handled by PublicSubscription component to avoid duplicate API calls
function SubscriptionRouteGuard({ children }) {
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  // Check token validity first
  const tokenCheck = checkTokenValidity();
  
  // If token is invalid, allow access to subscription page (for login)
  if (!tokenCheck.isValid) {
    return children;
  }

  // Token is valid - check user authentication
  if (isAuthenticated && user) {
    // Admin users: redirect directly to /admin (only token check needed)
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    // Regular users: Allow access to subscription page
    // PublicSubscription component will handle subscription-based redirects
  }

  return children;
}

function PublicRouteGuard({ children }) {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const location = useLocation();

  if (isAuthenticated) {
    if (user && user.role === 'admin') {
      return <Navigate to="/admin" state={{ from: location }} replace />;
    }
    return <Navigate to="/app" state={{ from: location }} replace />;
  }
  return children;
}

// Global Subscription Guard - Blocks all routes except /subscription for users without subscription
function GlobalSubscriptionGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  
  // Always call hooks at the top level - never conditionally
  // Get slug from pathname (will be empty string if no slug)
  const slug = window.location.pathname.split('/')[1] || '';
  const { subscriptionLoading, currentSubscription } = useStripeSubscription(slug);
  
  // Skip subscription check for /subscription route itself to prevent infinite loops
  // SubscriptionRouteGuard already handles /subscription route protection
  const isSubscriptionRoute = location.pathname === '/subscription' || 
                              location.pathname.startsWith('/subscription/');
  
  if (isSubscriptionRoute) {
    // Allow /subscription route to render without additional checks
    // SubscriptionRouteGuard will handle the redirect logic
    return children;
  }

  // Only make API call if not on subscription route and user is authenticated
  if (!isAuthenticated || !user || user.role === 'admin') {
    return children; // No subscription check needed for unauthenticated or admin
  }

  // Check subscription status synchronously for immediate redirect
  const checkSubscriptionAndRedirect = () => {
    // Wait for subscription data to load
    if (subscriptionLoading || !currentSubscription?.data?.stripe) {
      return false; // Still loading or no data yet
    }

    // Check if user has active subscription from Stripe API (PRIMARY CHECK)
    let hasActiveSubscription = false;

    const subscriptions = currentSubscription.data.stripe.subscriptions;
    
    // If Stripe API has been loaded and subscriptions array exists
    if (Array.isArray(subscriptions)) {
      // Filter for active subscriptions
      const activeSubscriptions = subscriptions.filter(
        sub => sub.status && ['active', 'trialing'].includes(sub.status.toLowerCase())
      );
      
      if (activeSubscriptions.length > 0) {
        const subscription = activeSubscriptions[0];
        if (subscription.current_period_end) {
          const expiryTimestamp = subscription.current_period_end * 1000;
          const now = Date.now();
          if (expiryTimestamp > now) {
            hasActiveSubscription = true;
          }
        } else {
          hasActiveSubscription = true;
        }
      }
    }

    // If no active subscription, redirect immediately
    if (!hasActiveSubscription) {
      return true; // Need to redirect
    }

    return false; // No redirect needed
  };

  // Immediate redirect check using Navigate component (faster than useEffect)
  if (checkSubscriptionAndRedirect()) {
    return <Navigate to="/subscription" replace />;
  }

  return children;
}

function PublicRoutes() {
  const { language } = useLanguage();
  return (
    <RouteLoader loadTime={2000}>
      <GlobalSubscriptionGuard>
        {/* Demo ke liye language show kar rahe hain */}
        {/* <div>Current language: {language}</div> */}
        <Routes>
        <Route path="/" element={<LandingPage language={language} />} />
        <Route path="contact-sales" element={<ContactSales language={language} />} />
        <Route path="login" element={
          <PublicRouteGuard>
            <Login />
          </PublicRouteGuard>
        } />
        <Route path="register" element={
          <PublicRouteGuard>
            <Register />
          </PublicRouteGuard>
        } />
        <Route path="thank-you" element={<ThankYou />} />
        <Route path="verify-email/:token" element={<EmailVerify />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="ref/:referralCode" element={<ReferralPage />} />
        <Route path="reviews" element={<ReviewPage />} />
        <Route path="qr/redirect/:qrId" element={<QRScanHandler />} />
        <Route path="qr/:qrId" element={<DirectMessageSend />} />
        <Route path="scan/:qrId" element={<QRScanHandler />} />
        <Route path="qr-scan/:qrId" element={<QRScanHandler />} />
        <Route path="scan-qr/:qrId" element={<QRScanHandler />} />
        <Route path="subscription" element={
          <SubscriptionRouteGuard>
            <PublicSubscription />
          </SubscriptionRouteGuard>
        } />
        <Route path="subscription/success" element={<SubscriptionSuccess />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="update-payment" element={<UpdatePayment />} />
        {/* Add more public routes here in the future */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalSubscriptionGuard>
    </RouteLoader>
  );
}

export default PublicRoutes;
