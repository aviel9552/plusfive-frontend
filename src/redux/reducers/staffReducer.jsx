import {
  GET_ALL_STAFF_REQUEST,
  GET_ALL_STAFF_SUCCESS,
  GET_ALL_STAFF_FAILURE,
  GET_STAFF_BY_ID_REQUEST,
  GET_STAFF_BY_ID_SUCCESS,
  GET_STAFF_BY_ID_FAILURE,
  CREATE_STAFF_REQUEST,
  CREATE_STAFF_SUCCESS,
  CREATE_STAFF_FAILURE,
  UPDATE_STAFF_REQUEST,
  UPDATE_STAFF_SUCCESS,
  UPDATE_STAFF_FAILURE,
  DELETE_STAFF_REQUEST,
  DELETE_STAFF_SUCCESS,
  DELETE_STAFF_FAILURE,
  DELETE_MULTIPLE_STAFF_REQUEST,
  DELETE_MULTIPLE_STAFF_SUCCESS,
  DELETE_MULTIPLE_STAFF_FAILURE
} from '../actions/staffActions';

const initialState = {
  staff: [],
  selectedStaff: null,
  loading: false,
  error: null
};

const staffReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==== GET ALL STAFF ====
    case GET_ALL_STAFF_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_ALL_STAFF_SUCCESS:
      return {
        ...state,
        loading: false,
        staff: action.payload,
        error: null
      };

    case GET_ALL_STAFF_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== GET STAFF BY ID ====
    case GET_STAFF_BY_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_STAFF_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedStaff: action.payload,
        error: null
      };

    case GET_STAFF_BY_ID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== CREATE STAFF ====
    case CREATE_STAFF_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CREATE_STAFF_SUCCESS:
      return {
        ...state,
        loading: false,
        staff: [action.payload, ...state.staff],
        error: null
      };

    case CREATE_STAFF_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== UPDATE STAFF ====
    case UPDATE_STAFF_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case UPDATE_STAFF_SUCCESS:
      const { staffId, staff } = action.payload;
      return {
        ...state,
        loading: false,
        staff: state.staff.map(s => 
          s.id === staffId ? staff : s
        ),
        selectedStaff: state.selectedStaff?.id === staffId ? staff : state.selectedStaff,
        error: null
      };

    case UPDATE_STAFF_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== DELETE STAFF ====
    case DELETE_STAFF_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_STAFF_SUCCESS:
      const deletedStaffId = action.payload;
      return {
        ...state,
        loading: false,
        staff: state.staff.filter(s => s.id !== deletedStaffId),
        selectedStaff: state.selectedStaff?.id === deletedStaffId ? null : state.selectedStaff,
        error: null
      };

    case DELETE_STAFF_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== DELETE MULTIPLE STAFF ====
    case DELETE_MULTIPLE_STAFF_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_MULTIPLE_STAFF_SUCCESS:
      const deletedStaffIds = action.payload;
      return {
        ...state,
        loading: false,
        staff: state.staff.filter(s => !deletedStaffIds.includes(s.id)),
        selectedStaff: deletedStaffIds.includes(state.selectedStaff?.id) ? null : state.selectedStaff,
        error: null
      };

    case DELETE_MULTIPLE_STAFF_FAILURE:
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

export default staffReducer;
