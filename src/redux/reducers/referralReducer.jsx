import {
  GET_USER_REFERRALS_REQUEST,
  GET_USER_REFERRALS_SUCCESS,
  GET_USER_REFERRALS_FAILURE,
  GET_ALL_REFERRALS_REQUEST,
  GET_ALL_REFERRALS_SUCCESS,
  GET_ALL_REFERRALS_FAILURE
} from '../actions/referralActions';

const initialState = {
  userReferrals: [],
  allReferrals: [],
  loading: false,
  error: null
};

const referralReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==== FETCH USER REFERRALS ====
    case GET_USER_REFERRALS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_USER_REFERRALS_SUCCESS:
      const newState = {
        ...state,
        loading: false,
        userReferrals: action.payload,
        error: null
      };
      return newState;

    case GET_USER_REFERRALS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== FETCH ALL REFERRALS ====
    case GET_ALL_REFERRALS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_ALL_REFERRALS_SUCCESS:
      return {
        ...state,
        loading: false,
        allReferrals: action.payload,
        error: null
      };

    case GET_ALL_REFERRALS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== DEFAULT ====
    default:
      return state;
  }
};

export default referralReducer;
