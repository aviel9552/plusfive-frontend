import apiClient from '../../config/apiClient.jsx';

// GET /api/services - Get all services for logged-in user
export const getAllServices = async () => {
  try {
    const response = await apiClient.get('/services');
    // Backend returns: { success: true, data: { services: [...], total: number } }
    if (response.data?.success && response.data?.data?.services) {
      return response.data.data.services;
    }
    // Fallback: if response is already an array (legacy format)
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If response has data but not in expected format, return empty array
    return [];
  } catch (error) {
    console.error('Error in getAllServices:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to get services';
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

// GET /api/services/:id - Get service by ID
export const getServiceById = async (id) => {
  try {
    const response = await apiClient.get(`/services/${id}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in getServiceById:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to get service';
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

// POST /api/services - Create new service
export const createService = async (serviceData) => {
  try {
    const response = await apiClient.post('/services', serviceData);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in createService:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to create service';
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

// PUT /api/services/:id - Update service
export const updateService = async (id, serviceData) => {
  try {
    const response = await apiClient.put(`/services/${id}`, serviceData);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in updateService:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to update service';
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

// DELETE /api/services/:id - Delete service (soft delete)
export const deleteService = async (id) => {
  try {
    const response = await apiClient.delete(`/services/${id}`);
    if (response.data?.success) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in deleteService:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to delete service';
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

// DELETE /api/services/bulk/delete - Delete multiple services (bulk delete)
export const deleteMultipleServices = async (ids) => {
  try {
    const response = await apiClient.delete('/services/bulk/delete', { data: { ids } });
    if (response.data?.success) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in deleteMultipleServices:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to delete services';
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
