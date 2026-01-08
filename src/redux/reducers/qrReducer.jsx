import {
  FETCH_QRS_REQUEST,
  FETCH_QRS_SUCCESS,
  FETCH_QRS_FAILURE,
  FETCH_MY_QRS_REQUEST,
  FETCH_MY_QRS_SUCCESS,
  FETCH_MY_QRS_FAILURE,
  FETCH_QR_REQUEST,
  FETCH_QR_SUCCESS,
  FETCH_QR_FAILURE,
  CREATE_QR_REQUEST,
  CREATE_QR_SUCCESS,
  CREATE_QR_FAILURE,
  CREATE_QR_WITH_USER_INFO_REQUEST,
  CREATE_QR_WITH_USER_INFO_SUCCESS,
  CREATE_QR_WITH_USER_INFO_FAILURE,
  DELETE_QR_REQUEST,
  DELETE_QR_SUCCESS,
  DELETE_QR_FAILURE,
  // Analytics Action Types
  FETCH_QR_ANALYTICS_REQUEST,
  FETCH_QR_ANALYTICS_SUCCESS,
  FETCH_QR_ANALYTICS_FAILURE,
  FETCH_QR_PERFORMANCE_REQUEST,
  FETCH_QR_PERFORMANCE_SUCCESS,
  FETCH_QR_PERFORMANCE_FAILURE,
  FETCH_INDIVIDUAL_QR_ANALYTICS_REQUEST,
  FETCH_INDIVIDUAL_QR_ANALYTICS_SUCCESS,
  FETCH_INDIVIDUAL_QR_ANALYTICS_FAILURE
} from '../actions/qrActions';

const initialState = {
  qrCodes: [],
  myQRCodes: [],
  currentQRCode: null,
  loading: false,
  error: null,
  // Analytics state
  qrAnalytics: null,
  qrPerformance: null,
  individualQRAnalytics: null,
  analyticsLoading: false,
  analyticsError: null
};

const qrReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==== FETCH ALL QR CODES ====
    case FETCH_QRS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_QRS_SUCCESS:
      return {
        ...state,
        loading: false,
        qrCodes: action.payload,
        error: null
      };

    case FETCH_QRS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== FETCH MY QR CODES ====
    case FETCH_MY_QRS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_MY_QRS_SUCCESS:
      return {
        ...state,
        loading: false,
        myQRCodes: action.payload,
        error: null
      };

    case FETCH_MY_QRS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== FETCH SINGLE QR CODE ====
    case FETCH_QR_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_QR_SUCCESS:
      return {
        ...state,
        loading: false,
        currentQRCode: action.payload,
        error: null
      };

    case FETCH_QR_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== CREATE QR CODE ====
    case CREATE_QR_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CREATE_QR_SUCCESS:
      return {
        ...state,
        loading: false,
        qrCodes: [...state.qrCodes, action.payload],
        myQRCodes: [...state.myQRCodes, action.payload],
        error: null
      };

    case CREATE_QR_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== CREATE QR CODE WITH USER INFO ====
    case CREATE_QR_WITH_USER_INFO_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CREATE_QR_WITH_USER_INFO_SUCCESS:
      return {
        ...state,
        loading: false,
        qrCodes: [...state.qrCodes, action.payload],
        myQRCodes: [...state.myQRCodes, action.payload],
        error: null
      };

    case CREATE_QR_WITH_USER_INFO_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== DELETE QR CODE ====
    case DELETE_QR_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_QR_SUCCESS:
      return {
        ...state,
        loading: false,
        qrCodes: state.qrCodes.filter(qr => qr.id !== action.payload),
        myQRCodes: state.myQRCodes.filter(qr => qr.id !== action.payload),
        currentQRCode: state.currentQRCode?.id === action.payload ? null : state.currentQRCode,
        error: null
      };

    case DELETE_QR_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== FETCH QR ANALYTICS ====
    case FETCH_QR_ANALYTICS_REQUEST:
      return {
        ...state,
        analyticsLoading: true,
        analyticsError: null
      };

    case FETCH_QR_ANALYTICS_SUCCESS:
      return {
        ...state,
        analyticsLoading: false,
        qrAnalytics: action.payload,
        analyticsError: null
      };

    case FETCH_QR_ANALYTICS_FAILURE:
      return {
        ...state,
        analyticsLoading: false,
        analyticsError: action.payload
      };

    // ==== FETCH QR PERFORMANCE ====
    case FETCH_QR_PERFORMANCE_REQUEST:
      return {
        ...state,
        analyticsLoading: true,
        analyticsError: null
      };

    case FETCH_QR_PERFORMANCE_SUCCESS:
      return {
        ...state,
        analyticsLoading: false,
        qrPerformance: action.payload,
        analyticsError: null
      };

    case FETCH_QR_PERFORMANCE_FAILURE:
      return {
        ...state,
        analyticsLoading: false,
        analyticsError: action.payload
      };

    // ==== FETCH INDIVIDUAL QR ANALYTICS ====
    case FETCH_INDIVIDUAL_QR_ANALYTICS_REQUEST:
      return {
        ...state,
        analyticsLoading: true,
        analyticsError: null
      };

    case FETCH_INDIVIDUAL_QR_ANALYTICS_SUCCESS:
      return {
        ...state,
        analyticsLoading: false,
        individualQRAnalytics: action.payload,
        analyticsError: null
      };

    case FETCH_INDIVIDUAL_QR_ANALYTICS_FAILURE:
      return {
        ...state,
        analyticsLoading: false,
        analyticsError: action.payload
      };

    // ==== DEFAULT ====
    default:
      return state;
  }
};

export default qrReducer; 