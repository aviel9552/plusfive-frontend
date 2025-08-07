import { getAllQRCodes, getQRCodeById, createQRCode, deleteQRCodeById, createQRCodeWithUserInfo } from '../services/qrServices';

// Action Types
export const FETCH_QRS_REQUEST = 'FETCH_QRS_REQUEST';
export const FETCH_QRS_SUCCESS = 'FETCH_QRS_SUCCESS';
export const FETCH_QRS_FAILURE = 'FETCH_QRS_FAILURE';

export const FETCH_QR_REQUEST = 'FETCH_QR_REQUEST';
export const FETCH_QR_SUCCESS = 'FETCH_QR_SUCCESS';
export const FETCH_QR_FAILURE = 'FETCH_QR_FAILURE';

export const CREATE_QR_REQUEST = 'CREATE_QR_REQUEST';
export const CREATE_QR_SUCCESS = 'CREATE_QR_SUCCESS';
export const CREATE_QR_FAILURE = 'CREATE_QR_FAILURE';

export const CREATE_QR_WITH_USER_INFO_REQUEST = 'CREATE_QR_WITH_USER_INFO_REQUEST';
export const CREATE_QR_WITH_USER_INFO_SUCCESS = 'CREATE_QR_WITH_USER_INFO_SUCCESS';
export const CREATE_QR_WITH_USER_INFO_FAILURE = 'CREATE_QR_WITH_USER_INFO_FAILURE';

export const DELETE_QR_REQUEST = 'DELETE_QR_REQUEST';
export const DELETE_QR_SUCCESS = 'DELETE_QR_SUCCESS';
export const DELETE_QR_FAILURE = 'DELETE_QR_FAILURE';

// Action Creators

// Fetch all QR codes
export const fetchQRCodes = () => async (dispatch) => {
  dispatch({ type: FETCH_QRS_REQUEST });
  try {
    const response = await getAllQRCodes();
    const qrData = response.data || response;
    dispatch({
      type: FETCH_QRS_SUCCESS,
      payload: qrData
    });
    return { success: true, data: qrData };
  } catch (error) {
    dispatch({
      type: FETCH_QRS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Fetch QR code by ID
export const fetchQRCodeById = (qrId) => async (dispatch) => {
  dispatch({ type: FETCH_QR_REQUEST });
  try {
    const response = await getQRCodeById(qrId);
    dispatch({
      type: FETCH_QR_SUCCESS,
      payload: response.data || response
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    dispatch({
      type: FETCH_QR_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Create QR code
export const createQRCodeAction = (qrData) => async (dispatch) => {
  dispatch({ type: CREATE_QR_REQUEST });
  try {
    const response = await createQRCode(qrData);
    dispatch({
      type: CREATE_QR_SUCCESS,
      payload: response.data || response
    });
    return { success: true, data: response };
  } catch (error) {
    dispatch({
      type: CREATE_QR_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Create QR code with user info
export const createQRCodeWithUserInfoAction = (qrData) => async (dispatch) => {
  dispatch({ type: CREATE_QR_WITH_USER_INFO_REQUEST });
  try {
    const response = await createQRCodeWithUserInfo(qrData);
    // API response structure: { success: true, message: "...", data: {...} }
    const qrCodeData = response.data || response;
    dispatch({
      type: CREATE_QR_WITH_USER_INFO_SUCCESS,
      payload: qrCodeData
    });
    return { success: true, data: qrCodeData };
  } catch (error) {
    dispatch({
      type: CREATE_QR_WITH_USER_INFO_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Delete QR code by ID
export const deleteQRCode = (qrId) => async (dispatch) => {
  dispatch({ type: DELETE_QR_REQUEST });
  try {
    const response = await deleteQRCodeById(qrId);
    dispatch({
      type: DELETE_QR_SUCCESS,
      payload: qrId
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    dispatch({
      type: DELETE_QR_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
}; 