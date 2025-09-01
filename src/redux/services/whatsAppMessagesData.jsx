import apiClient from '../../config/apiClient.jsx';

// Get all WhatsApp messages data
export const getAllWhatsAppMessagesData = async () => {
    try {
      const response = await apiClient.get('/whatsapp-messages');
      return response.data.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch WhatsApp messages');
      } else if (error.request) {
        throw new Error('No response received from server. Please check your network connection.');
      } else {
        throw new Error('An unexpected error occurred while fetching WhatsApp messages. Please try again.');
      }
    }
  };
  