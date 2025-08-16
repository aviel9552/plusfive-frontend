// Review service for API calls
import apiClient from '../config/apiClient';

export const reviewService = {
  // Add new review
  addReview: async (reviewData) => {
    try {
      const response = await apiClient.post('/reviews/add', reviewData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Review submission error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to submit review'
      };
    }
  }
};

export default reviewService;
