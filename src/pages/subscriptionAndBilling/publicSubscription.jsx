import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa';
import Pricing from '../../components/subscriptionAndBilling/Pricing';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import { logoutUser } from '../../redux/actions/authActions';

const PublicSubscription = () => {
  const slug = window.location.pathname.split('/')[1];
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  
  // Get subscription data from Stripe API
  const { subscriptionLoading, currentSubscription } = useStripeSubscription(slug);

  // Helper function to check if user has active subscription
  const hasActiveSubscription = () => {
    // FIRST: Check Stripe API response (most reliable source)
    if (currentSubscription?.data?.stripe?.subscriptions) {
      const activeSubscriptions = currentSubscription.data.stripe.subscriptions.filter(
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
    }

    // SECOND: Check user data from Redux (fallback)
    if (user) {
      const subscriptionStatus = user?.subscriptionStatus;
      
      // If subscription status is null, undefined, or empty, no subscription
      if (!subscriptionStatus || subscriptionStatus.trim() === '') {
        return false;
      }
      
      // Convert to lowercase for comparison
      const status = subscriptionStatus.toLowerCase();
      const expirationDate = user?.subscriptionExpirationDate;
      
      // Only consider active if subscription status is explicitly 'active'
      if (status === 'active') {
        if (expirationDate) {
          const expiryDate = new Date(expirationDate);
          const now = new Date();
          return expiryDate.getTime() > now.getTime(); // Check if not expired
        }
        return true; // Active with no expiry date
      }
    }

    // No active subscription found
    return false;
  };

  // Check authentication and redirect accordingly
  useEffect(() => {
    if (isAuthenticated && user) {
      // Admin users: Only check token, redirect directly to /admin
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      // Regular users: Check subscription status (wait for subscription data to load)
      if (!subscriptionLoading) {
        // If user has active subscription, redirect to /app (don't show subscription page)
        if (hasActiveSubscription()) {
          navigate('/app', { replace: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionLoading, isAuthenticated, user, currentSubscription, navigate]);

  // Handle logout and redirect to login
  const handleGoBack = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  // Render subscription page
  return (
    <div className="min-h-screen bg-white dark:bg-customBlack py-8 px-4 flex items-center justify-center relative">
      {/* Go Back Button - Top Right */}
      <button
        onClick={handleGoBack}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <FaArrowLeft />
        <span>Go Back</span>
      </button>

      <div className="max-w-7xl w-full mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select the perfect plan for your business needs
          </p>
        </div>
        {/* Show Pricing component - centered */}
        <div className="flex justify-center">
          <Pricing slug={slug} subscriptionLoading={subscriptionLoading} />
        </div>
      </div>
    </div>
  );
};

export default PublicSubscription;

