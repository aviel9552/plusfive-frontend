// src/redux/reducers/userReducer.jsx

import {
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE
} from '../actions/userActions';

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==== FETCH ALL USERS ====
    case FETCH_USERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload,
        error: null
      };

    case FETCH_USERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== FETCH SINGLE USER ====
    case FETCH_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        currentUser: action.payload,
        error: null
      };

    case FETCH_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== CREATE USER ====
    case CREATE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: [...state.users, action.payload],
        currentUser: action.payload,
        error: null
      };

    case CREATE_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== UPDATE USER ====
    case 'USER_UPDATE_REQUEST':
    case 'USER_UPDATE_SUCCESS':
    case 'USER_UPDATE_FAILURE':
      if (action.type === 'USER_UPDATE_REQUEST') {
        return {
          ...state,
          loading: true,
          error: null
        };
      }

      if (action.type === 'USER_UPDATE_SUCCESS') {
        const updatedUsers = state.users.map(user => {
          if (String(user.id) === String(action.payload.id)) {
            return {
              ...user,
              ...action.payload
            };
          }
          return user;
        });

        return {
          ...state,
          loading: false,
          users: updatedUsers,
          currentUser: action.payload,
          error: null
        };
      }

      if (action.type === 'USER_UPDATE_FAILURE') {
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      }

      return state;

    // ==== DELETE USER ====
    case DELETE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter(user => user.id !== action.payload),
        currentUser: state.currentUser?.id === action.payload ? null : state.currentUser,
        error: null
      };

    case DELETE_USER_FAILURE:
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

export default userReducer;
