// redux/actions/authActions.jsx
import { loginUser as loginUserService } from '../services/authService';
import { updateUserProfile as updateUserProfileService } from '../services/authService';

const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGOUT = 'LOGOUT';
const UPDATE_USER = 'UPDATE_USER';
const UPDATE_USER_REQUEST = 'UPDATE_USER_REQUEST';
const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS';
const UPDATE_USER_FAILURE = 'UPDATE_USER_FAILURE';

export const loginUser = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const data = await loginUserService(email, password);
    
    dispatch({
      type: LOGIN_SUCCESS,
      accessToken: data.data.token, // Changed from access_token to token
      user: data.data.user,
    });
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.message || 'Failed to fetch services',
    });
    console.error('Login failed:', error);
    throw error;
  }
};

export const updateUser = (userData) => (dispatch) => {
  dispatch({
    type: UPDATE_USER,
    payload: userData,
  });
  // Update localStorage
  const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const updatedUserData = { ...currentUserData, ...userData };
  localStorage.setItem('userData', JSON.stringify(updatedUserData));
};

export const updateUserProfile = (userData) => async (dispatch) => {
  dispatch({ type: UPDATE_USER_REQUEST });
  try {
    const data = await updateUserProfileService(userData);
    dispatch({
      type: UPDATE_USER_SUCCESS,
      user: data.data || data.data.user,
    });
    return { success: true, data };
  } catch (error) {
    dispatch({
      type: UPDATE_USER_FAILURE,
      payload: error.message || 'Failed to update profile',
    });
    console.error('Update profile failed:', error);
    // Return error without throwing
    return { success: false, error: error.message || 'Failed to update profile' };
  }
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  localStorage.removeItem('userRole');
  document.cookie = 'token=; path=/; max-age=0';
  dispatch({ type: LOGOUT });
};
