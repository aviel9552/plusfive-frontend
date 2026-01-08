/**
 * Waitlist service - API calls for waitlist management
 */

import apiClient from '../../config/apiClient.jsx';

/**
 * Get all waitlist items
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} - Response data
 */
export const getWaitlistItems = async (filters = {}) => {
  try {
    const response = await apiClient.get('/waitlist', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error in getWaitlistItems:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get waitlist items');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * Create a new waitlist item
 * @param {Object} waitlistData - Waitlist item data
 * @returns {Promise<Object>} - Created waitlist item
 */
export const createWaitlistItem = async (waitlistData) => {
  try {
    const response = await apiClient.post('/waitlist', waitlistData);
    return response.data;
  } catch (error) {
    console.error('Error in createWaitlistItem:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create waitlist item');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * Update a waitlist item
 * @param {string} waitlistId - Waitlist item ID
 * @param {Object} waitlistData - Updated waitlist item data
 * @returns {Promise<Object>} - Updated waitlist item
 */
export const updateWaitlistItem = async (waitlistId, waitlistData) => {
  try {
    const response = await apiClient.put(`/waitlist/${waitlistId}`, waitlistData);
    return response.data;
  } catch (error) {
    console.error('Error in updateWaitlistItem:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update waitlist item');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * Delete a waitlist item
 * @param {string} waitlistId - Waitlist item ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteWaitlistItem = async (waitlistId) => {
  try {
    const response = await apiClient.delete(`/waitlist/${waitlistId}`);
    return response.data;
  } catch (error) {
    console.error('Error in deleteWaitlistItem:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete waitlist item');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

