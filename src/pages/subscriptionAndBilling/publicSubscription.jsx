import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa';
import Pricing from '../../components/subscriptionAndBilling/Pricing';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import { logoutUser } from '../../redux/actions/authActions';

const PublicSubscription = () => {
  const slug = window.location.pathname.split('/')[1];
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get subscription loading state to control Pricing component visibility
  const { subscriptionLoading } = useStripeSubscription(slug);

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

