import { getAllUsers, getUserById, updateUserById, deleteUserById, createUser as createUserService } from '../services/userServices';

// Action Types
export const FETCH_USERS_REQUEST = 'FETCH_USERS_REQUEST';
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS';
export const FETCH_USERS_FAILURE = 'FETCH_USERS_FAILURE';

export const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const CREATE_USER_REQUEST = 'CREATE_USER_REQUEST';
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS';
export const CREATE_USER_FAILURE = 'CREATE_USER_FAILURE';

export const UPDATE_USER_REQUEST = 'USER_UPDATE_REQUEST';
export const UPDATE_USER_SUCCESS = 'USER_UPDATE_SUCCESS';
export const UPDATE_USER_FAILURE = 'USER_UPDATE_FAILURE';

export const DELETE_USER_REQUEST = 'DELETE_USER_REQUEST';
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS';
export const DELETE_USER_FAILURE = 'DELETE_USER_FAILURE';

// Action Creators

// Fetch all users
export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: FETCH_USERS_REQUEST });
  try {
    const response = await getAllUsers();
    const usersData = response.data || response;
    dispatch({
      type: FETCH_USERS_SUCCESS,
      payload: usersData
    });
    return { success: true, data: usersData };
  } catch (error) {
    dispatch({
      type: FETCH_USERS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Fetch user by ID
export const fetchUserById = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USER_REQUEST });
  try {
    const response = await getUserById(userId);
    dispatch({
      type: FETCH_USER_SUCCESS,
      payload: response.data || response
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    dispatch({
      type: FETCH_USER_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Create user
export const createUser = (userData) => async (dispatch) => {
  dispatch({ type: CREATE_USER_REQUEST });
  try {
    const response = await createUserService(userData);
    dispatch({
      type: CREATE_USER_SUCCESS,
      payload: response.data
    });
    return { success: true, data: response.data };
  } catch (error) {
    dispatch({
      type: CREATE_USER_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Update user by ID
export const updateUser = (userId, userData) => async (dispatch) => {
  dispatch({ type: UPDATE_USER_REQUEST });
  
  try {
    const response = await updateUserById(userId, userData);
    
    dispatch({
      type: UPDATE_USER_SUCCESS,
      payload: response.data
    });
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: error.message || 'Failed to update user' };
  }
};

// Delete user by ID
export const deleteUser = (userId) => async (dispatch) => {
  dispatch({ type: DELETE_USER_REQUEST });
  try {
    const response = await deleteUserById(userId);
    dispatch({
      type: DELETE_USER_SUCCESS,
      payload: userId
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    dispatch({
      type: DELETE_USER_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
}; 