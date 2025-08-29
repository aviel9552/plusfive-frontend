import apiClient from '../config/apiClient';

// Get all payment methods for the current user
export const getPaymentMethods = async () => {
  try {
    const response = await apiClient.get('/stripe/payment-methods');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to fetch payment methods. Please try again.'
    );
  }
};

// Add a new payment method
export const addPaymentMethod = async (paymentData) => {
  try {
    const response = await apiClient.post('/stripe/payment-methods', paymentData);
    return response.data;
  } catch (error) {
    console.error('Failed to add payment method:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to add payment method. Please try again.'
    );
  }
};

// Update an existing payment method
export const updatePaymentMethod = async (paymentMethodId, updateData) => {
  try {
    const response = await apiClient.put(`/stripe/payment-methods/${paymentMethodId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Failed to update payment method:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to update payment method. Please try again.'
    );
  }
};

// Remove a payment method
export const removePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await apiClient.delete(`/stripe/payment-methods/${paymentMethodId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to remove payment method:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to remove payment method. Please try again.'
    );
  }
};
