import apiClient from '../../config/apiClient';

/**
 * Simple Payment Services
 * Professional Redux service for handling simple payment operations
 */

// Create simple checkout session
export const createSimpleCheckout = async (paymentData) => {
  try {
    const response = await apiClient.post('/stripe/simple-checkout', {
      amount: paymentData.amount,
      currency: paymentData.currency || 'ils',
      description: paymentData.description || 'Simple Payment',
      successUrl: paymentData.successUrl,
      cancelUrl: paymentData.cancelUrl
    });

    return {
      success: true,
      data: response.data.data,
      message: 'Checkout session created successfully'
    };
  } catch (error) {
    console.error('Create simple checkout error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create checkout session',
      data: null
    };
  }
};

// Update payment status to succeeded
export const updatePaymentStatus = async (sessionId) => {
  try {
    const response = await apiClient.post('/stripe/update-payment-status', {
      sessionId: sessionId
    });

    return {
      success: true,
      data: response.data.data,
      message: 'Payment status updated successfully'
    };
  } catch (error) {
    console.error('Update payment status error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update payment status',
      data: null
    };
  }
};

// Get user payment history
export const getPaymentHistory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);

    const response = await apiClient.get(`/stripe/payment-history?${queryParams.toString()}`);

    // Handle both response formats: { invoices: [...] } or { success: true, data: { payments: [...] } }
    let responseData = response.data;
    if (responseData.data) {
      // Old format with success/data wrapper
      responseData = responseData.data;
    }

    return {
      success: true,
      data: responseData, // This will have either { invoices: [...] } or { payments: [...] }
      message: 'Payment history fetched successfully'
    };
  } catch (error) {
    console.error('Get payment history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch payment history',
      data: null
    };
  }
};

// Get payment history by type
export const getPaymentHistoryByType = async (type, page = 1, limit = 10) => {
  return await getPaymentHistory({ type, page, limit });
};

// Get subscription payments
export const getSubscriptionPayments = async (page = 1, limit = 10) => {
  return await getPaymentHistoryByType('subscription', page, limit);
};

// Get simple payments
export const getSimplePayments = async (page = 1, limit = 10) => {
  return await getPaymentHistoryByType('simple', page, limit);
};
