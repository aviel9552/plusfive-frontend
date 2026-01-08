import apiClient from '../../config/apiClient.jsx';

// GET /api/referrals/my - Get current user's referrals
export const getUserReferrals = async () => {
  try {
    const response = await apiClient.get('/referrals/my');
    return response.data;
  } catch (error) {
    console.error('Error in getUserReferrals:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get user referrals');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// GET /api/referrals/all - Get all referrals (admin only)
export const getAllReferrals = async () => {
  try {
    const response = await apiClient.get('/referrals/all');
    return response.data;
  } catch (error) {
    console.error('Error in getAllReferrals:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get all referrals');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
