import apiClient from '../../config/apiClient.jsx';

// GET /api/categories - Get all categories
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    if (response.data?.success && response.data?.data?.categories) {
      return response.data.data.categories;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to get categories';
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

// GET /api/categories/:id - Get category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await apiClient.get(`/categories/${id}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to get category';
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

// POST /api/categories - Create new category
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in createCategory:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to create category';
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

// PUT /api/categories/:id - Update category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to update category';
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

// DELETE /api/categories/:id - Delete category (soft delete)
export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/categories/${id}`);
    if (response.data?.success) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to delete category';
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

// DELETE /api/categories/bulk/delete - Delete multiple categories (bulk delete)
export const deleteMultipleCategories = async (categoryIds) => {
  try {
    const response = await apiClient.delete('/categories/bulk/delete', { data: { categoryIds } });
    if (response.data?.success) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error in deleteMultipleCategories:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to delete categories';
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
