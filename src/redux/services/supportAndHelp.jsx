import apiClient from '../../config/apiClient';

// Send support email
export const sendSupportEmail = async (emailData) => {
  try {
    const { email, ticketSubject, ticketIssues } = emailData;
    
    const response = await apiClient.post('/support/email', {
      email,
      ticketSubject,
      ticketIssues
    });
    
    return response.data;
  } catch (error) {
    console.error('Send support email error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to send support email');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Create new support ticket
export const createSupportTicket = async (ticketData) => {
  try {
    const { subject, description, priority, category, email } = ticketData;
    
    const response = await apiClient.post('/support', {
      subject,
      description,
      priority,
      email,
      category
    });
    
    return response.data;
  } catch (error) {
    console.error('Create support ticket error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create support ticket');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
