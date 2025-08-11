import apiClient from '../../config/apiClient.jsx';

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });

    // Extract token and user from response
    const { token, user } = response.data.data;

    // Store the token and user data in localStorage
    if (token) {
      localStorage.setItem('token', token);
    }
    
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userRole', user.role);

    // Set token in a cookie for middleware usage
    // setAuthCookie(token);

    return response.data;
  } catch (error) {
    console.error('Error in loginUser:', error);
    // Better error handling
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error(error.message || 'Login failed');
    }
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!user.id) {
      throw new Error('No authentication token found');
    }

    // Use admin API route with user ID
    const response = await apiClient.put(`/users/${user.id}`, userData);

    const updatedUser = response.data.data || response.data;

    // Update localStorage with new user data
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    localStorage.setItem('userRole', updatedUser.role);

    return response.data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    if (error.response) {
      // Handle specific 403 errors
      if (error.response.status === 403) {
        if (error.response.data?.message?.includes('permission') || error.response.data?.message?.includes('access')) {
          throw new Error('You do not have permission to update this profile. Please contact administrator.');
        } else if (error.response.data?.message?.includes('token')) {
          throw new Error('Your session has expired. Please login again.');
        } else {
          throw new Error('Access denied. Please check your permissions.');
        }
      }
      // Server responded with error status
      throw new Error(error.response.data.message || 'Failed to update profile');
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error(error.message || 'Failed to update profile');
    }
  }
};

export const resendVerificationEmail = async (email) => {
  try {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    console.error('Error in resendVerificationEmail:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to resend verification email');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await apiClient.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to verify email');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to send password reset email');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await apiClient.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    console.error('Error in resetPassword:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to reset password');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.put('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error in changePassword:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to change password');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error in registerUser:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const createReferral = async (referralData) => {
  try {
    const response = await apiClient.post('/referrals', referralData);
    return response.data;
  } catch (error) {
    console.error('Error in createReferral:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create referral');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
