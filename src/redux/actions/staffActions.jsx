import { 
  getAllStaff, 
  getStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  deleteMultipleStaff 
} from '../services/staffService';

// Action Types
export const GET_ALL_STAFF_REQUEST = 'GET_ALL_STAFF_REQUEST';
export const GET_ALL_STAFF_SUCCESS = 'GET_ALL_STAFF_SUCCESS';
export const GET_ALL_STAFF_FAILURE = 'GET_ALL_STAFF_FAILURE';

export const GET_STAFF_BY_ID_REQUEST = 'GET_STAFF_BY_ID_REQUEST';
export const GET_STAFF_BY_ID_SUCCESS = 'GET_STAFF_BY_ID_SUCCESS';
export const GET_STAFF_BY_ID_FAILURE = 'GET_STAFF_BY_ID_FAILURE';

export const CREATE_STAFF_REQUEST = 'CREATE_STAFF_REQUEST';
export const CREATE_STAFF_SUCCESS = 'CREATE_STAFF_SUCCESS';
export const CREATE_STAFF_FAILURE = 'CREATE_STAFF_FAILURE';

export const UPDATE_STAFF_REQUEST = 'UPDATE_STAFF_REQUEST';
export const UPDATE_STAFF_SUCCESS = 'UPDATE_STAFF_SUCCESS';
export const UPDATE_STAFF_FAILURE = 'UPDATE_STAFF_FAILURE';

export const DELETE_STAFF_REQUEST = 'DELETE_STAFF_REQUEST';
export const DELETE_STAFF_SUCCESS = 'DELETE_STAFF_SUCCESS';
export const DELETE_STAFF_FAILURE = 'DELETE_STAFF_FAILURE';

export const DELETE_MULTIPLE_STAFF_REQUEST = 'DELETE_MULTIPLE_STAFF_REQUEST';
export const DELETE_MULTIPLE_STAFF_SUCCESS = 'DELETE_MULTIPLE_STAFF_SUCCESS';
export const DELETE_MULTIPLE_STAFF_FAILURE = 'DELETE_MULTIPLE_STAFF_FAILURE';

// Action Creators

// Get all staff
export const getAllStaffAction = () => async (dispatch) => {
  dispatch({ type: GET_ALL_STAFF_REQUEST });
  try {
    const staff = await getAllStaff();
    dispatch({
      type: GET_ALL_STAFF_SUCCESS,
      payload: staff
    });
    return { success: true, data: staff };
  } catch (error) {
    dispatch({
      type: GET_ALL_STAFF_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Get staff by ID
export const getStaffByIdAction = (staffId) => async (dispatch) => {
  dispatch({ type: GET_STAFF_BY_ID_REQUEST });
  try {
    const staff = await getStaffById(staffId);
    dispatch({
      type: GET_STAFF_BY_ID_SUCCESS,
      payload: staff
    });
    return { success: true, data: staff };
  } catch (error) {
    dispatch({
      type: GET_STAFF_BY_ID_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Create staff
export const createStaffAction = (staffData) => async (dispatch) => {
  dispatch({ type: CREATE_STAFF_REQUEST });
  try {
    const staff = await createStaff(staffData);
    dispatch({
      type: CREATE_STAFF_SUCCESS,
      payload: staff
    });
    return { success: true, data: staff };
  } catch (error) {
    dispatch({
      type: CREATE_STAFF_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Update staff
export const updateStaffAction = (staffId, staffData) => async (dispatch) => {
  dispatch({ type: UPDATE_STAFF_REQUEST });
  try {
    const staff = await updateStaff(staffId, staffData);
    dispatch({
      type: UPDATE_STAFF_SUCCESS,
      payload: { staffId, staff }
    });
    return { success: true, data: staff };
  } catch (error) {
    dispatch({
      type: UPDATE_STAFF_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Delete staff
export const deleteStaffAction = (staffId) => async (dispatch) => {
  dispatch({ type: DELETE_STAFF_REQUEST });
  try {
    await deleteStaff(staffId);
    dispatch({
      type: DELETE_STAFF_SUCCESS,
      payload: staffId
    });
    return { success: true };
  } catch (error) {
    dispatch({
      type: DELETE_STAFF_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Delete multiple staff
export const deleteMultipleStaffAction = (staffIds) => async (dispatch) => {
  dispatch({ type: DELETE_MULTIPLE_STAFF_REQUEST });
  try {
    await deleteMultipleStaff(staffIds);
    dispatch({
      type: DELETE_MULTIPLE_STAFF_SUCCESS,
      payload: staffIds
    });
    return { success: true };
  } catch (error) {
    dispatch({
      type: DELETE_MULTIPLE_STAFF_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};
