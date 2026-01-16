import { getAllCategories, getCategoryById, updateCategory as updateCategoryService, deleteCategory as deleteCategoryService, createCategory as createCategoryService, deleteMultipleCategories as deleteMultipleCategoriesService } from '../services/categoryService';

// Action Types
export const FETCH_CATEGORIES_REQUEST = 'FETCH_CATEGORIES_REQUEST';
export const FETCH_CATEGORIES_SUCCESS = 'FETCH_CATEGORIES_SUCCESS';
export const FETCH_CATEGORIES_FAILURE = 'FETCH_CATEGORIES_FAILURE';

export const FETCH_CATEGORY_REQUEST = 'FETCH_CATEGORY_REQUEST';
export const FETCH_CATEGORY_SUCCESS = 'FETCH_CATEGORY_SUCCESS';
export const FETCH_CATEGORY_FAILURE = 'FETCH_CATEGORY_FAILURE';

export const CREATE_CATEGORY_REQUEST = 'CREATE_CATEGORY_REQUEST';
export const CREATE_CATEGORY_SUCCESS = 'CREATE_CATEGORY_SUCCESS';
export const CREATE_CATEGORY_FAILURE = 'CREATE_CATEGORY_FAILURE';

export const UPDATE_CATEGORY_REQUEST = 'UPDATE_CATEGORY_REQUEST';
export const UPDATE_CATEGORY_SUCCESS = 'UPDATE_CATEGORY_SUCCESS';
export const UPDATE_CATEGORY_FAILURE = 'UPDATE_CATEGORY_FAILURE';

export const DELETE_CATEGORY_REQUEST = 'DELETE_CATEGORY_REQUEST';
export const DELETE_CATEGORY_SUCCESS = 'DELETE_CATEGORY_SUCCESS';
export const DELETE_CATEGORY_FAILURE = 'DELETE_CATEGORY_FAILURE';

export const DELETE_MULTIPLE_CATEGORIES_REQUEST = 'DELETE_MULTIPLE_CATEGORIES_REQUEST';
export const DELETE_MULTIPLE_CATEGORIES_SUCCESS = 'DELETE_MULTIPLE_CATEGORIES_SUCCESS';
export const DELETE_MULTIPLE_CATEGORIES_FAILURE = 'DELETE_MULTIPLE_CATEGORIES_FAILURE';

// Action Creators

// Fetch all categories
export const fetchCategories = () => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORIES_REQUEST });
  try {
    const categories = await getAllCategories();
    dispatch({
      type: FETCH_CATEGORIES_SUCCESS,
      payload: categories
    });
    return { success: true, data: categories };
  } catch (error) {
    dispatch({
      type: FETCH_CATEGORIES_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Fetch category by ID
export const fetchCategoryById = (categoryId) => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORY_REQUEST });
  try {
    const category = await getCategoryById(categoryId);
    dispatch({
      type: FETCH_CATEGORY_SUCCESS,
      payload: category
    });
    return { success: true, data: category };
  } catch (error) {
    dispatch({
      type: FETCH_CATEGORY_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Create category
export const createCategory = (categoryData) => async (dispatch) => {
  dispatch({ type: CREATE_CATEGORY_REQUEST });
  try {
    const category = await createCategoryService(categoryData);
    dispatch({
      type: CREATE_CATEGORY_SUCCESS,
      payload: category
    });
    return { success: true, data: category };
  } catch (error) {
    dispatch({
      type: CREATE_CATEGORY_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Update category
export const updateCategory = (categoryId, categoryData) => async (dispatch) => {
  dispatch({ type: UPDATE_CATEGORY_REQUEST });
  try {
    const category = await updateCategoryService(categoryId, categoryData);
    dispatch({
      type: UPDATE_CATEGORY_SUCCESS,
      payload: category
    });
    return { success: true, data: category };
  } catch (error) {
    dispatch({
      type: UPDATE_CATEGORY_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Delete category
export const deleteCategory = (categoryId) => async (dispatch) => {
  dispatch({ type: DELETE_CATEGORY_REQUEST });
  try {
    await deleteCategoryService(categoryId);
    dispatch({
      type: DELETE_CATEGORY_SUCCESS,
      payload: categoryId
    });
    return { success: true };
  } catch (error) {
    dispatch({
      type: DELETE_CATEGORY_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Delete multiple categories
export const deleteMultipleCategories = (categoryIds) => async (dispatch) => {
  dispatch({ type: DELETE_MULTIPLE_CATEGORIES_REQUEST });
  try {
    await deleteMultipleCategoriesService(categoryIds);
    dispatch({
      type: DELETE_MULTIPLE_CATEGORIES_SUCCESS,
      payload: categoryIds
    });
    return { success: true };
  } catch (error) {
    dispatch({
      type: DELETE_MULTIPLE_CATEGORIES_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};
