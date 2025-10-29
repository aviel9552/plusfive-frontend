import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  getStripePrices, 
  createCheckoutSession, 
  getCurrentSubscription,
  cancelSubscription,
  reactivateSubscription,
  getCustomerPortalSession
} from '../services/stripeService';
import { toast } from 'react-toastify';

export const useStripeSubscription = (slug) => {
  const [prices, setPrices] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = !!user;

  // Helper function to validate authentication state
  const validateAuthState = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (!user || !token) {
      console.warn('⚠️ Authentication state incomplete:', { user: !!user, token: !!token });
      return false;
    }
    
    if (token === 'undefined' || token === 'null') {
      console.warn('⚠️ Invalid token value:', token);
      return false;
    }
    
    return true;
  }, [user]);

  // Fetch available pricing plans
  const fetchPrices = useCallback(async () => {
    try {
      setPricesLoading(true);
      const response = await getStripePrices();
      
      // Extract prices from the nested response structure
      const prices = response?.data?.prices || response?.prices || response;
      
      setPrices(prices);
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setPricesLoading(false);
    }
  }, []);

  // Fetch current subscription
  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setSubscriptionLoading(true);
      const data = await getCurrentSubscription();
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // Show error toast for subscription fetch to help with debugging
      if (error.message.includes('endpoint not found')) {
        toast.error('Stripe subscription endpoint not configured. Please contact support.');
      } else if (error.message.includes('Authentication required')) {
        toast.error('Please login again to view your subscription.');
      } else {
        toast.error('Unable to load subscription details. Please try again later.');
      }
    } finally {
      setSubscriptionLoading(false);
    }
  }, [isAuthenticated]);

  // Create checkout session
  const handleSubscribe = useCallback(async (priceId, planName, meterId) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }

    // Validate authentication state before proceeding
    if (!validateAuthState()) {
      toast.error('Authentication state invalid. Please login again.');
      return;
    }

    try {
      setLoading(true);
            
      const successUrl = `${window.location.origin}/subscription/success`;
      const cancelUrl = `${window.location.origin}/${slug}/subscription-and-billing`;
      
      const checkoutResponse = await createCheckoutSession(priceId, successUrl, cancelUrl, meterId);
      
      
      // Validate the checkout response
      if (!checkoutResponse || !checkoutResponse.url) {
        throw new Error('Invalid checkout response: Missing checkout URL');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutResponse.url;
    } catch (error) {
      console.error('❌ Failed to create checkout session:', error);
      
      // Provide specific error messages based on error type
      if (error.message.includes('Authentication required')) {
        toast.error('Please login again to continue with your subscription');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (error.message.includes('User not found')) {
        toast.error('User account not found. Please contact support or try logging in again.');
      } else if (error.message.includes('Access denied')) {
        toast.error('You do not have permission to create subscriptions. Please contact support.');
      } else {
        toast.error(error.message || 'Failed to start subscription process. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, validateAuthState]);

  // Cancel subscription
  const handleCancelSubscription = useCallback(async (cancellationReason = '') => {
    if (!currentSubscription) return;

    try {
      setLoading(true);
      
      // Get the subscription ID from the nested structure
      const subscriptionId = currentSubscription?.data?.stripe?.subscriptions?.[0]?.id;
      
      if (!subscriptionId) {
        throw new Error('No subscription ID found');
      }
      
      
      await cancelSubscription(subscriptionId);
      
      // Show success message with next steps
      toast.success(
        'Subscription Cancelled Successfully! You\'ll have access until the end of your billing period.',
        { autoClose: 3000 }
      );
      
      // Refresh page after successful cancellation to update UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to cancel subscription';
      if (error.message.includes('not found')) {
        errorMessage = 'Subscription not found. Please refresh and try again.';
      } else if (error.message.includes('already cancelled')) {
        errorMessage = 'Subscription is already cancelled.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'You do not have permission to cancel this subscription.';
      } else {
        errorMessage = error.message || 'Failed to cancel subscription. Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentSubscription, fetchSubscription]);

  // Reactivate subscription
  const handleReactivateSubscription = useCallback(async () => {
    if (!currentSubscription) return;

    try {
      setLoading(true);
      
      // Get the subscription ID from the nested structure
      const subscriptionId = currentSubscription?.data?.stripe?.subscriptions?.[0]?.id;
      
      if (!subscriptionId) {
        throw new Error('No subscription ID found');
      }
      
      await reactivateSubscription(subscriptionId);
      toast.success('Subscription reactivated successfully');
      await fetchSubscription(); // Refresh subscription data
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      toast.error(error.message || 'Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  }, [currentSubscription, fetchSubscription]);

  // Open customer portal
  const handleOpenCustomerPortal = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const { url } = await getCustomerPortalSession(window.location.href);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      toast.error(error.message || 'Failed to open customer portal');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load initial data
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    prices,
    currentSubscription,
    loading,
    pricesLoading,
    subscriptionLoading,
    isAuthenticated,
    handleSubscribe,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleOpenCustomerPortal,
    fetchPrices,
    fetchSubscription,
    validateAuthState
  };
};
