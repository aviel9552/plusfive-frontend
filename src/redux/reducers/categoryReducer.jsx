import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  FETCH_CATEGORY_REQUEST,
  FETCH_CATEGORY_SUCCESS,
  FETCH_CATEGORY_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  DELETE_MULTIPLE_CATEGORIES_REQUEST,
  DELETE_MULTIPLE_CATEGORIES_SUCCESS,
  DELETE_MULTIPLE_CATEGORIES_FAILURE
} from '../actions/categoryActions';

const initialState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null
};

const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==== FETCH ALL CATEGORIES ====
    case FETCH_CATEGORIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload,
        error: null
      };

    case FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== FETCH CATEGORY BY ID ====
    case FETCH_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        currentCategory: action.payload,
        error: null
      };

    case FETCH_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== CREATE CATEGORY ====
    case CREATE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: [...state.categories, action.payload],
        error: null
      };

    case CREATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== UPDATE CATEGORY ====
    case UPDATE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        ),
        currentCategory: state.currentCategory?.id === action.payload.id
          ? action.payload
          : state.currentCategory,
        error: null
      };

    case UPDATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== DELETE CATEGORY ====
    case DELETE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.filter(cat => cat.id !== action.payload),
        currentCategory: state.currentCategory?.id === action.payload
          ? null
          : state.currentCategory,
        error: null
      };

    case DELETE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== DELETE MULTIPLE CATEGORIES ====
    case DELETE_MULTIPLE_CATEGORIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_MULTIPLE_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.filter(cat => !action.payload.includes(cat.id)),
        error: null
      };

    case DELETE_MULTIPLE_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default categoryReducer;
