import apiClient from '../../config/apiClient';

const reviewService = {
    // Send rating request to customer
    sendRatingRequest: async (requestData) => {
        try {
            const response = await apiClient.post('/reviews/send-rating-request', requestData);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error sending rating request:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to send rating request'
            };
        }
    },

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
    },

    // Send rating via WhatsApp
    sendRatingViaWhatsApp: async (requestData) => {
        try {
            const response = await apiClient.post('/whatsapp/review/send-rating', requestData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error sending rating via WhatsApp:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to send rating via WhatsApp'
            };
        }
    }
};

export default reviewService;
