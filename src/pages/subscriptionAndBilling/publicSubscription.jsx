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
  
  // Get subscription loading state to control Pricing component visibility
  const { subscriptionLoading } = useStripeSubscription(slug);

  // Helper function to check if user has active subscription
  const hasActiveSubscription = () => {
    // Admin users don't need subscription, but they should not access subscription page
    if (user?.role === 'admin') {
      return true; // Admin has access, redirect them
    }

    // Check localStorage cache first
    try {
      const cachedSub = localStorage.getItem('hasActiveSubscription');
      const cachedExpiry = localStorage.getItem('subscriptionExpiry');
      
      if (cachedSub === 'true' && cachedExpiry) {
        const expiryDate = new Date(cachedExpiry);
        const now = new Date();
        if (expiryDate.getTime() > now.getTime()) {
          return true; // Active subscription found in cache
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
      
      // All other statuses (pending, canceled, inactive, etc.) mean no active subscription
      return false;
    }

    // No user data means no subscription
    return false;
  };

  // Check if user has active subscription and redirect accordingly
  useEffect(() => {
    // Only check if user is authenticated
    if (isAuthenticated && user) {
      // If user has active subscription, redirect to /app (don't show subscription page)
      if (hasActiveSubscription()) {
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/app', { replace: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, navigate]);

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

