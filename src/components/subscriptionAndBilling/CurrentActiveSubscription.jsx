import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonButton, CommonCustomOutlineButton } from '../index';
import { CgCreditCard } from 'react-icons/cg';
import { MdWarning, MdInfo, MdCheckCircle, MdError, MdCancel } from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';

const SubscriptionDetail = ({ title, value }) => (
  <div className='flex flex-col gap-[16px]'>
    <p className="text-18 dark:text-white text-black">{title}</p>
    <p className="mt-1 text-16 dark:text-white text-black ">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-[#D0E2FF] text-[#2537A5]';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <span className={`px-3 p-1 text-16 font-medium rounded-full ${getStatusColor(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};

function CurrentActiveSubscription({ slug }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getUserCardTranslations(language);
  
  // State for cancel confirmation dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Get current subscription data from Stripe
  const { currentSubscription, subscriptionLoading, handleCancelSubscription, handleOpenCustomerPortal } = useStripeSubscription();
  
  const handleUpdatePayment = () => {
    if (currentSubscription) {
      // Option 1: Navigate to Payment Methods Manager (Recommended)
      navigate('/app/update-payment');
      
      // Option 2: Open Stripe Customer Portal
      // handleOpenCustomerPortal();
    } else {
      navigate('/app/update-payment');
    }
  };

  const handleCancel = () => {
    if (currentSubscription) {
      setShowCancelDialog(true);
    }
  };

  const confirmCancellation = async () => {
    setIsCancelling(true);
    try {
      await handleCancelSubscription(cancellationReason);
      setShowCancelDialog(false);
      setCancellationReason('');
      // Success message will be shown by the hook
    } catch (error) {
      console.error('Cancellation failed:', error);
      // Error message will be shown by the hook
    } finally {
      setIsCancelling(false);
    }
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
    setCancellationReason('');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Extract subscription data from the nested structure - Only active/trialing subscriptions
  const getActiveSubscription = () => {
    if (!currentSubscription?.data?.stripe?.subscriptions) return null;
    
    // Filter out canceled subscriptions - only show active, trialing, or past_due
    const activeSubscriptions = currentSubscription.data.stripe.subscriptions.filter(
      sub => sub.status && !['canceled', 'unpaid', 'incomplete', 'incomplete_expired'].includes(sub.status.toLowerCase())
    );
    
    return activeSubscriptions.length > 0 ? activeSubscriptions[0] : null;
  };

  const getPlanName = () => {
    const subscription = getActiveSubscription();
    if (!subscription) return 'No Active Plan';
    
    // Get the product ID from the subscription
    const productId = subscription.items?.data?.[0]?.plan?.product;
    
    // Map product IDs to plan names based on your Stripe setup
    const planNameMap = {
      'prod_SwTx8DIjYRUOzB': 'Starter Plan',
      'prod_SwTymqc2gU74Iu': 'Premium Plan', 
      'prod_SwTzVJFwvltfmJ': 'Business Plan'
    };
    
    if (productId && planNameMap[productId]) {
      return planNameMap[productId];
    }
    
    // Fallback: try to get from other sources
    const planName = subscription.items?.data?.[0]?.plan?.nickname || 
                    subscription.items?.data?.[0]?.plan?.product || 
                    'Active Plan';
    
    return planName;
  };

  const getStartDate = () => {
    const subscription = getActiveSubscription();
    if (!subscription) return 'N/A';
    return formatDate(subscription.current_period_start);
  };

  const getEndDate = () => {
    const subscription = getActiveSubscription();
    if (!subscription) return 'N/A';
    return formatDate(subscription.current_period_end);
  };

  const getStatus = () => {
    const subscription = getActiveSubscription();
    if (!subscription) return 'No Subscription';
    return subscription.status || 'Unknown';
  };

  const getAmount = () => {
    const subscription = getActiveSubscription();
    if (!subscription) return 'N/A';
    
    const plan = subscription.items?.data?.[0]?.plan;
    const amount = plan?.amount;
    const interval = plan?.interval; // 'day', 'month', or 'year'
    
    if (amount) {
      const formattedAmount = `₪${(amount / 100).toFixed(2)}`;
      
      // Display interval based on plan interval
      let intervalText = '/month'; // default
      if (interval === 'day') {
        intervalText = '/day';
      } else if (interval === 'year') {
        intervalText = '/year';
      } else if (interval === 'month') {
        intervalText = '/month';
      }
      
      return `${formattedAmount}${intervalText}`;
    }
    return 'N/A';
  };

  // Check if there are any active subscriptions (exclude canceled)
  const hasActiveSubscription = () => {
    if (!currentSubscription?.data?.stripe?.subscriptions) return false;
    
    // Filter out canceled subscriptions
    const activeSubscriptions = currentSubscription.data.stripe.subscriptions.filter(
      sub => sub.status && !['canceled', 'unpaid', 'incomplete', 'incomplete_expired'].includes(sub.status.toLowerCase())
    );
    
    return activeSubscriptions.length > 0;
  };

  // Professional Cancel Subscription Confirmation Dialog
  const CancelConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-customBrown rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <MdWarning className="text-red-600 dark:text-red-400 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.cancelSubscription || 'Cancel Subscription'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.cancelSubscriptionActionCannotBeUndone || 'This action cannot be undone'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t.cancelSubscriptionConfirmMessage 
              ? (
                  <>
                    {t.cancelSubscriptionConfirmMessage.split('{planName}')[0]}
                    <strong>{getPlanName()}</strong>
                    {t.cancelSubscriptionConfirmMessage.split('{planName}')[1]}
                  </>
                )
              : (
                  <>
                    Are you sure you want to cancel your <strong>{getPlanName()}</strong> subscription? You'll continue to have access until the end of your current billing period.
                  </>
                )}
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.reasonForCancellation || 'Reason for cancellation (optional)'}
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder={t.helpUsImproveService || 'Help us improve our service...'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MdInfo className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium">{t.whatHappensNext || 'What happens next?'}</p>
                <ul className="mt-1 space-y-1">
                  <li>• {t.accessContinuesUntil ? t.accessContinuesUntil.replace('{date}', getEndDate()) : `Access continues until ${getEndDate()}`}</li>
                  <li>• {t.noMoreCharges || 'No more charges will be made'}</li>
                  <li>• {t.canReactivateAnytime || 'You can reactivate anytime'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <CommonCustomOutlineButton
            text={t.keepSubscription || 'Keep Subscription'}
            onClick={closeCancelDialog}
            className="flex-1"
            disabled={isCancelling}
          />
          <CommonButton
            text={isCancelling ? (t.cancelling || 'Cancelling...') : (t.cancelSubscription || 'Cancel Subscription')}
            onClick={confirmCancellation}
            className="flex-1 bg-red-600 hover:bg-red-700 !text-white"
            disabled={isCancelling}
          />
        </div>
      </div>
    </div>
  );
  
  // Don't render if no subscription and not loading
  if (!subscriptionLoading && !hasActiveSubscription()) {
    return (
      <div className="font-ttcommons dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl p-[24px] dark:text-white dark:hover:bg-customBlack shadow-md hover:shadow-sm">
        <div className='flex flex-col gap-[24px]'>
          <h2 className="text-20 font-semibold">{t.currentActiveSubscription}</h2>
          <div className="md:p-[24px] rounded-xl md:border dark:border-commonBorder border-gray-200 dark:bg-customBrown bg-customBody">
            <div className="text-center py-8">
              <p className="text-black dark:text-white text-16">
                {t.noActiveSubscriptionFound || 'No active subscription found.'}
                <br />
                {/* <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => navigate('/pricing')}>
                  View available plans
                </span> */}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && <CancelConfirmationDialog />}
      
      <div className="font-ttcommons dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl p-[24px] dark:text-white dark:hover:bg-customBlack shadow-md hover:shadow-sm">

        <div className='flex flex-col gap-[24px]'>

          <div className="flex items-center justify-between">
            <h2 className="text-20 font-semibold">{t.currentActiveSubscription}</h2>
            {/* <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Active Subscription
              </span>
            </div> */}
          </div>

          {subscriptionLoading ? (
            <div className="md:p-[24px] rounded-xl md:border dark:border-commonBorder border-gray-200 dark:bg-customBrown bg-customBody">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">{t.loadingSubscription || 'Loading subscription...'}</span>
              </div>
            </div>
          ) : (
            <div className="md:p-[24px] rounded-xl md:border dark:border-commonBorder border-gray-200 dark:bg-customBrown bg-customBody">
              {/* Enhanced Subscription Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pb-6 border-b border-gray-200 dark:border-commonBorder">
                <SubscriptionDetail title={t.subscription || 'Subscription'} value={getPlanName()} />
                <SubscriptionDetail title={t.amount || 'Amount'} value={getAmount()} />
                <SubscriptionDetail title={t.startDate || 'Start Date'} value={getStartDate()} />
                <SubscriptionDetail title={t.nextBilling || 'Next Billing'} value={getEndDate()} />
                <div className='flex flex-col gap-[16px]'>
                  <p className="text-18 dark:text-white text-black">{t.status || 'Status'}</p>
                  <div className="mt-1">
                    <StatusBadge status={getStatus()} />
                  </div>
                </div>
              </div>

              {/* Additional Subscription Info */}
              {/* <div className="py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MdInfo className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subscription Details
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Subscription ID:</span>
                    <p className="text-gray-900 dark:text-white font-mono text-xs">
                      {getActiveSubscription()?.id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Billing Cycle:</span>
                    <p className="text-gray-900 dark:text-white">
                      {getActiveSubscription()?.items?.data?.[0]?.plan?.interval || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Currency:</span>
                    <p className="text-gray-900 dark:text-white uppercase">
                      {getActiveSubscription()?.items?.data?.[0]?.plan?.currency || 'N/A'}
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row items-center gap-4 pt-[24px]">
                <CommonButton
                  text={t.updatePayment}
                  icon={<CgCreditCard className='rotate-180' />}
                  className="w-full md:w-auto px-6 py-3 !text-white rounded-lg text-14 bg-customPink hover:bg-customPink/90"
                  onClick={handleUpdatePayment}
                />
                <CommonCustomOutlineButton 
                  text={t.cancelSubscription || 'Cancel Subscription'} 
                  textColor='text-customRed' 
                  className="w-full md:w-auto text-14 px-6 py-3 border-red-300 hover:border-red-400"
                  onClick={handleCancel}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default CurrentActiveSubscription;
