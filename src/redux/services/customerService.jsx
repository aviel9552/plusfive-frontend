import apiClient from '../../config/apiClient.jsx';

// POST /api/customers - Add new customer
export const addCustomer = async (customerData) => {
  try {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Error in addCustomer:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to add customer');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// GET /api/customers - Get all customers of current business owner
export const getMyCustomers = async () => {
  try {
    const response = await apiClient.get('/customers');
    return response.data;
  } catch (error) {
    console.error('Error in getMyCustomers:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get customers');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// GET /api/customers/:id - Get customer by ID
export const getCustomerById = async (customerId) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get customer');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// PUT /api/customers/:id - Update customer information
export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await apiClient.put(`/customers/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update customer');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// DELETE /api/customers/:id - Remove customer
export const removeCustomer = async (customerId) => {
  try {
    const response = await apiClient.delete(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error in removeCustomer:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to remove customer');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// POST /api/customers/:id/visit - Record customer visit
export const recordCustomerVisit = async (customerId, visitData) => {
  try {
    const response = await apiClient.post(`/customers/${customerId}/visit`, visitData);
    return response.data;
  } catch (error) {
    console.error('Error in recordCustomerVisit:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to record customer visit');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
