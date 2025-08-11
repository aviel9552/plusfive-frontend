import { getUserReferrals, getAllReferrals } from '../services/referralService';

// Action Types
export const GET_USER_REFERRALS_REQUEST = 'GET_USER_REFERRALS_REQUEST';
export const GET_USER_REFERRALS_SUCCESS = 'GET_USER_REFERRALS_SUCCESS';
export const GET_USER_REFERRALS_FAILURE = 'GET_USER_REFERRALS_FAILURE';

export const GET_ALL_REFERRALS_REQUEST = 'GET_ALL_REFERRALS_REQUEST';
export const GET_ALL_REFERRALS_SUCCESS = 'GET_ALL_REFERRALS_SUCCESS';
export const GET_ALL_REFERRALS_FAILURE = 'GET_ALL_REFERRALS_FAILURE';

// Action Creators

// Fetch user referrals
export const fetchUserReferrals = () => async (dispatch) => {
  dispatch({ type: GET_USER_REFERRALS_REQUEST });
  try {
    const response = await getUserReferrals();
    const referralData = response.data || response;
    dispatch({
      type: GET_USER_REFERRALS_SUCCESS,
      payload: referralData
    });
    return { success: true, data: referralData };
  } catch (error) {
    dispatch({
      type: GET_USER_REFERRALS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Fetch all referrals (admin only)
export const fetchAllReferrals = () => async (dispatch) => {
  dispatch({ type: GET_ALL_REFERRALS_REQUEST });
  try {
    const response = await getAllReferrals();
    const referralData = response.data || response;
    dispatch({
      type: GET_ALL_REFERRALS_SUCCESS,
      payload: referralData
    });
    return { success: true, data: referralData };
  } catch (error) {
    dispatch({
      type: GET_ALL_REFERRALS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};
