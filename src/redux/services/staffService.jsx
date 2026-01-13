import apiClient from '../../config/apiClient.jsx';

// GET /api/staff - Get all staff for logged-in user
export const getAllStaff = async () => {
  try {
    const response = await apiClient.get('/staff');
    // Backend returns: { success: true, data: { staff: [...], total: number } }
    if (response.data?.success && response.data?.data?.staff) {
      return response.data.data.staff;
    }
    // Fallback: if response is already an array (legacy format)
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If response has data but not in expected format, return empty array
    return [];
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to get staff';
      const errorToThrow = new Error(errorMessage);
      errorToThrow.status = error.response.status;
      errorToThrow.response = error.response;
      throw errorToThrow;
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// GET /api/staff/:id - Get staff by ID
export const getStaffById = async (id) => {
  try {
    const response = await apiClient.get(`/staff/${id}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in getStaffById:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to get staff';
      const errorToThrow = new Error(errorMessage);
      errorToThrow.status = error.response.status;
      errorToThrow.response = error.response;
      throw errorToThrow;
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// POST /api/staff - Create new staff
export const createStaff = async (staffData) => {
  try {
    const response = await apiClient.post('/staff', staffData);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in createStaff:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to create staff';
      const errorToThrow = new Error(errorMessage);
      errorToThrow.status = error.response.status;
      errorToThrow.response = error.response;
      throw errorToThrow;
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// PUT /api/staff/:id - Update staff
export const updateStaff = async (id, staffData) => {
  try {
    const response = await apiClient.put(`/staff/${id}`, staffData);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in updateStaff:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to update staff';
      const errorToThrow = new Error(errorMessage);
      errorToThrow.status = error.response.status;
      errorToThrow.response = error.response;
      throw errorToThrow;
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// DELETE /api/staff/:id - Delete staff (soft delete)
export const deleteStaff = async (id) => {
  try {
    const response = await apiClient.delete(`/staff/${id}`);
    if (response.data?.success) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in deleteStaff:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to delete staff';
      const errorToThrow = new Error(errorMessage);
      errorToThrow.status = error.response.status;
      errorToThrow.response = error.response;
      throw errorToThrow;
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// DELETE /api/staff/bulk/delete - Delete multiple staff (bulk delete)
export const deleteMultipleStaff = async (ids) => {
  try {
    const response = await apiClient.delete('/staff/bulk/delete', { data: { ids } });
    if (response.data?.success) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in deleteMultipleStaff:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to delete staff';
      const errorToThrow = new Error(errorMessage);
      errorToThrow.status = error.response.status;
      errorToThrow.response = error.response;
      throw errorToThrow;
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
