import apiClient from '../../config/apiClient.jsx';

// Get all QR codes
export const getAllQRCodes = async () => {
  try {
    const response = await apiClient.get('/qr');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch QR codes');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Get my QR codes
export const getMyQRCodes = async () => {
  try {
    const response = await apiClient.get('/qr/my-qr-codes');
    // Return the full response to handle the structure in action
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch my QR codes');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Get QR code by ID
export const getQRCodeById = async (qrId) => {
  try {
    const response = await apiClient.get(`/qr/${qrId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch QR code');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Create new QR code
export const createQRCode = async (qrData) => {
  try {
    const response = await apiClient.post('/qr', qrData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create QR code');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Create QR code with user info
export const createQRCodeWithUserInfo = async (qrData) => {
  try {
    const response = await apiClient.post('/qr/generate-with-user-info', qrData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create QR code with user info');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};


// Delete QR code by ID
export const deleteQRCodeById = async (qrId) => {
  try {
    const response = await apiClient.delete(`/qr/${qrId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete QR code');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
