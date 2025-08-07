import apiClient from '../../config/apiClient.jsx';

// Create user
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/users', userData);
    console.log("createUser response", response);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create user');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch users');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch user');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Update user by ID
export const updateUserById = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    console.log("updateUserById response", response);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update user');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Delete user by ID
export const deleteUserById = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete user');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
