import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonButton } from '../../components';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import { FaArrowLeft, FaCreditCard, FaHistory, FaCog } from 'react-icons/fa';

function BillingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getUserCardTranslations(language);
  
  const {
    currentSubscription,
    loading,
    handleOpenCustomerPortal
  } = useStripeSubscription();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleManageSubscription = () => {
    handleOpenCustomerPortal();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <CommonButton
              text=""
              onClick={handleGoBack}
              className="!p-2 !min-w-0"
              icon={<FaArrowLeft />}
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.billingInformation || 'Billing Information'}
            </h1>
          </div>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t.currentActiveSubscription || 'Current Active Subscription'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.subscription || 'Subscription'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentSubscription.planName || 'Premium Plan'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.status || 'Status'}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentSubscription.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {currentSubscription.status === 'active' ? t.active : currentSubscription.status}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.startDate || 'Start Date'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentSubscription.currentPeriodStart ? 
                    new Date(currentSubscription.currentPeriodStart * 1000).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.nextBillingDate || 'Next Billing Date'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentSubscription.currentPeriodEnd ? 
                    new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <CommonButton
              text="Manage Subscription"
              onClick={handleManageSubscription}
              className="!py-2 !px-4"
              disabled={loading}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your credit cards and payment methods
            </p>
            <CommonButton
              text="Manage"
              onClick={() => navigate('/payment-methods')}
              className="w-full !py-2"
              disabled={loading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaHistory className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment History
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View your billing history and invoices
            </p>
            <CommonButton
              text="View History"
              onClick={handleManageSubscription}
              className="w-full !py-2"
              disabled={loading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCog className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Billing Settings
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Configure your billing preferences
            </p>
            <CommonButton
              text="Configure"
              onClick={handleManageSubscription}
              className="w-full !py-2"
              disabled={loading}
            />
          </div>
        </div>

        {/* No Subscription Message */}
        {!currentSubscription && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              No Active Subscription
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have an active subscription. Visit our pricing page to get started.
            </p>
            <CommonButton
              text="View Pricing"
              onClick={() => navigate('/pricing')}
              className="!py-2 !px-6"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BillingPage;
