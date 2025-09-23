import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { CommonButton } from '../../components';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { getCurrentSubscription } from '../../services/stripeService';
import apiClient from '../../config/apiClient';

function SubscriptionSuccess() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const t = getUserCardTranslations(language);

  const sessionId = searchParams.get('session_id');
  const planName = searchParams.get('plan_name') || 'Premium Plan';

  // Update user table after payment success
  useEffect(() => {
    const updateUserAfterPayment = async () => {
      try {
        // Get latest subscription data
        const data = await getCurrentSubscription();
        
        // Find active subscription
        const activeSubscription = data.data?.stripe?.subscriptions?.find(sub => sub.status === 'active');
        
        if (activeSubscription) {
          // Update user table with latest Stripe data
          await apiClient.post('/stripe/direct-update-subscription', {
            subscriptionId: activeSubscription.id,
            userEmail: data.data.user.email
          });
        }
      } catch (error) {
        console.error('Update failed:', error);
      }
    };

    updateUserAfterPayment();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/app/subscription-and-billing');
    }
  }, [countdown, navigate]);

  const handleGoToDashboard = () => {
    navigate('/app/subscription-and-billing');
  };

  const handleViewBilling = () => {
    navigate('/billing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
          <FaCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t.subscriptionSuccess || 'Subscription Successful!'}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
          {t.welcomeTo || 'Welcome to'} <span className="font-semibold text-blue-600 dark:text-blue-400">{planName}</span>
        </p>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {t.subscriptionActive || 'Your subscription is now active. You can start using all the premium features immediately.'}
        </p>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Session ID: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">{sessionId}</code>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <CommonButton
            text={t.goToDashboard || 'Go to Subscription and Billing'}
            onClick={handleGoToDashboard}
            className="w-full !py-3 !text-16"
            icon={<FaArrowRight className="ml-2" />}
          />
          
          <CommonButton
            text={t.viewBilling || 'View Billing'}
            onClick={handleViewBilling}
            className="w-full !py-3 !text-16 bg-gray-600 hover:bg-gray-700"
          />
        </div>

        {/* Auto-redirect notice */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          {t.redirectingIn || 'Redirecting to dashboard in'} <span className="font-semibold">{countdown}</span> {t.seconds || 'seconds'}
        </p>
      </div>
    </div>
  );
}

export default SubscriptionSuccess;
