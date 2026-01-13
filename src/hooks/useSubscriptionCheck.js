import { useState, useEffect } from 'react';
import { getCurrentSubscription } from '../services/stripeService';

/**
 * Custom hook to check user's subscription status
 * @param {Object} options - Configuration options
 * @param {string} options.pageName - Name of the page for console logging (optional)
 * @param {boolean} options.enableLogging - Enable detailed console logging (default: false)
 * @returns {Object} { hasActiveSubscription, subscriptionLoading }
 */
export const useSubscriptionCheck = (options = {}) => {
  const { pageName = '', enableLogging = false } = options;
  
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (enableLogging) {
          console.log(`=== ${pageName ? pageName.toUpperCase() : 'PAGE'} - CHECKING SUBSCRIPTION STATUS ===`);
          console.log('📞 Calling API: GET /api/stripe/subscription');
        }
        
        setSubscriptionLoading(true);
        const response = await getCurrentSubscription();
        
        if (enableLogging) {
          console.log('💳 Full API Response:', response);
        }
        
        // Extract subscription data from response
        const subscriptionData = response?.data || response;
        
        if (enableLogging) {
          console.log('📦 Subscription Data:', subscriptionData);
        }
        
        // Get Stripe subscriptions
        const subscriptions = subscriptionData?.stripe?.subscriptions || subscriptionData?.stripe?.subscriptions || [];
        
        if (enableLogging) {
          console.log('📋 Total Subscriptions:', subscriptions.length);
        }
        
        if (subscriptions.length > 0) {
          if (enableLogging) {
            console.log('📋 All Subscriptions:', subscriptions);
          }
          
          // Find active subscription (not canceled, unpaid, incomplete, etc.)
          const activeSubscription = Array.isArray(subscriptions) ? subscriptions.find(
            sub => sub?.status && !['canceled', 'unpaid', 'incomplete', 'incomplete_expired'].includes(sub.status.toLowerCase())
          ) : null;
          
          if (enableLogging) {
            console.log('✅ Active Subscriptions:', activeSubscription ? 1 : 0);
          }
          
          if (activeSubscription) {
            const status = activeSubscription.status?.toLowerCase();
            const isActive = status === 'active' || status === 'trialing';
            const isNotCanceled = !activeSubscription.cancel_at_period_end;
            
            // Check expiration
            let isNotExpired = true;
            if (activeSubscription.current_period_end) {
              const expiryTimestamp = activeSubscription.current_period_end * 1000;
              isNotExpired = expiryTimestamp > Date.now();
            }
            
            const hasActive = isActive && isNotCanceled && isNotExpired;
            setHasActiveSubscription(hasActive);
            
            if (enableLogging) {
              if (hasActive) {
                console.log('🎉 USER HAS ACTIVE SUBSCRIPTION!');
                console.log('📋 Subscription Details:', {
                  id: activeSubscription.id,
                  status: activeSubscription.status,
                  plan: activeSubscription.items?.data?.[0]?.price?.nickname || activeSubscription.plan?.nickname || 'N/A',
                  periodStart: activeSubscription.current_period_start 
                    ? new Date(activeSubscription.current_period_start * 1000).toLocaleString() 
                    : 'N/A',
                  periodEnd: activeSubscription.current_period_end 
                    ? new Date(activeSubscription.current_period_end * 1000).toLocaleString() 
                    : 'N/A',
                  cancelAtPeriodEnd: activeSubscription.cancel_at_period_end
                });
                console.log('✅ RESULT: User has active subscription');
              } else {
                console.warn('⚠️ USER DOES NOT HAVE ACTIVE SUBSCRIPTION');
                console.log('Subscription status:', {
                  status: activeSubscription.status,
                  isActive,
                  isNotCanceled,
                  isNotExpired
                });
                console.log('❌ RESULT: User does NOT have active subscription');
              }
            }
          } else {
            if (enableLogging) {
              console.warn('⚠️ NO ACTIVE SUBSCRIPTIONS FOUND');
              console.log('All subscriptions are:', subscriptions.map(s => ({
                id: s.id,
                status: s.status,
                canceled: s.cancel_at_period_end
              })));
              console.log('❌ RESULT: User does NOT have active subscription');
            }
            setHasActiveSubscription(false);
          }
        } else {
          if (enableLogging) {
            console.warn('⚠️ NO SUBSCRIPTIONS FOUND');
            console.log('❌ RESULT: User has not taken any subscription');
          }
          setHasActiveSubscription(false);
        }
        
        // Also log user data if available
        if (enableLogging && subscriptionData?.user) {
          console.log('👤 User Data:', {
            email: subscriptionData.user.email,
            subscriptionStatus: subscriptionData.user.subscriptionStatus,
            subscriptionPlan: subscriptionData.user.subscriptionPlan
          });
        }
        
        if (enableLogging) {
          console.log('=== END SUBSCRIPTION CHECK ===');
        }
        
      } catch (error) {
        if (enableLogging) {
          console.error('❌ Error checking subscription:', error);
          console.error('Error message:', error.message);
          console.warn('⚠️ Could not check subscription status');
        } else {
          console.error('Error checking subscription:', error);
        }
        setHasActiveSubscription(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    // Call the subscription check
    checkSubscription();
  }, [pageName, enableLogging]);

  return {
    hasActiveSubscription,
    subscriptionLoading
  };
};
