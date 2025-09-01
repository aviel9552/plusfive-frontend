import apiClient from '../config/apiClient';

// Get all available Stripe prices (public endpoint)
export const getStripePrices = async () => {
  try {
    const response = await apiClient.get('/stripe/prices');
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Pricing endpoint not found. Please check if the backend route is configured.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch pricing plans. Please try again later.');
    }
  }
};

// Create checkout session (protected endpoint)
export const createCheckoutSession = async (priceId, successUrl, cancelUrl, meterId) => {
  try {
    // Debug: Log the request details
    const token = localStorage.getItem('token');

    const response = await apiClient.post('/stripe/checkout', {
      priceId,
      successUrl,
      cancelUrl,
      meterId
    });
    
    // Validate the response structure
    if (!response.data) {
      throw new Error('Invalid response from server: No data received');
    }
    
    if (!response.data.data.url) {
      console.error('❌ Response missing checkout URL:', response.data);
      throw new Error('Invalid response from server: Checkout URL not found');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Checkout session creation failed:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You may not have permission to create subscriptions.');
    } else if (error.response?.status === 404) {
      throw new Error('Checkout endpoint not found. Please check if the backend route is configured.');
    } else if (error.response?.status === 500) {
      throw new Error(`Server error: ${error.response.data?.message || error.response.data?.error || 'Internal server error'}`);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.statusText || 'Request failed'}`);
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to create checkout session. Please try again later.');
    }
  }
};

// Get current user subscription (protected endpoint)
export const getCurrentSubscription = async () => {
  try {
    const response = await apiClient.get('/stripe/subscription');
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Subscription endpoint not found. Please check if the backend route is configured.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You may not have permission to view subscriptions.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch subscription. Please try again later.');
    }
  }
};

// Cancel subscription (protected endpoint)
export const cancelSubscription = async (subscriptionId) => {
  try {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required to cancel subscription');
    }
    
    const response = await apiClient.post(`/stripe/subscription/${subscriptionId}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
  }
};

// Reactivate subscription (protected endpoint)
export const reactivateSubscription = async (subscriptionId) => {
  try {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required to reactivate subscription');
    }
    
    const response = await apiClient.post(`/stripe/subscription/${subscriptionId}/reactivate`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reactivate subscription');
  }
};

// Get customer portal session (protected endpoint)
export const getCustomerPortalSession = async (returnUrl) => {
  try {
    const response = await apiClient.post('/stripe/customer-portal', {
      returnUrl
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create customer portal session');
  }
};
