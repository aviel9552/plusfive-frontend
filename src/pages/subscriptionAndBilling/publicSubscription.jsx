import React from 'react';
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

  // DISABLED: Redirect authenticated users with active subscription to /app
  // Allow users to stay on /subscription page even if they have active subscription
  // useEffect(() => {
  //   if (hasRedirected.current) return;

  //   // Only check for authenticated users (non-admin)
  //   if (isAuthenticated && user && user.role !== 'admin') {
  //     // Wait for subscription data to load
  //     if (!subscriptionLoading && currentSubscription?.data?.stripe) {
  //       const subscriptions = currentSubscription.data.stripe.subscriptions;
  //       
  //       if (Array.isArray(subscriptions)) {
  //         const activeSubscriptions = subscriptions.filter(
  //           sub => sub.status && ['active', 'trialing'].includes(sub.status.toLowerCase())
  //         );
  //         
  //         if (activeSubscriptions.length > 0) {
  //           const subscription = activeSubscriptions[0];
  //           const hasActiveSubscription = subscription.current_period_end 
  //             ? subscription.current_period_end * 1000 > Date.now()
  //             : true;
  //           
  //           if (hasActiveSubscription) {
  //             hasRedirected.current = true;
  //             navigate('/app', { replace: true });
  //           }
  //         }
  //       }
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isAuthenticated, user, subscriptionLoading, currentSubscription]);

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

