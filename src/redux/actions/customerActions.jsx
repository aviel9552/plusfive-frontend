import { 
  addCustomer, 
  getMyCustomers, 
  getCustomerById, 
  updateCustomer, 
  removeCustomer, 
  recordCustomerVisit,
  bulkImportCustomers
} from '../services/customerService';

// Action Types
export const ADD_CUSTOMER_REQUEST = 'ADD_CUSTOMER_REQUEST';
export const ADD_CUSTOMER_SUCCESS = 'ADD_CUSTOMER_SUCCESS';
export const ADD_CUSTOMER_FAILURE = 'ADD_CUSTOMER_FAILURE';

export const GET_MY_CUSTOMERS_REQUEST = 'GET_MY_CUSTOMERS_REQUEST';
export const GET_MY_CUSTOMERS_SUCCESS = 'GET_MY_CUSTOMERS_SUCCESS';
export const GET_MY_CUSTOMERS_FAILURE = 'GET_MY_CUSTOMERS_FAILURE';

export const GET_CUSTOMER_BY_ID_REQUEST = 'GET_CUSTOMER_BY_ID_REQUEST';
export const GET_CUSTOMER_BY_ID_SUCCESS = 'GET_CUSTOMER_BY_ID_SUCCESS';
export const GET_CUSTOMER_BY_ID_FAILURE = 'GET_CUSTOMER_BY_ID_FAILURE';

export const UPDATE_CUSTOMER_REQUEST = 'UPDATE_CUSTOMER_REQUEST';
export const UPDATE_CUSTOMER_SUCCESS = 'UPDATE_CUSTOMER_SUCCESS';
export const UPDATE_CUSTOMER_FAILURE = 'UPDATE_CUSTOMER_FAILURE';

export const REMOVE_CUSTOMER_REQUEST = 'REMOVE_CUSTOMER_REQUEST';
export const REMOVE_CUSTOMER_SUCCESS = 'REMOVE_CUSTOMER_SUCCESS';
export const REMOVE_CUSTOMER_FAILURE = 'REMOVE_CUSTOMER_FAILURE';

export const RECORD_CUSTOMER_VISIT_REQUEST = 'RECORD_CUSTOMER_VISIT_REQUEST';
export const RECORD_CUSTOMER_VISIT_SUCCESS = 'RECORD_CUSTOMER_VISIT_SUCCESS';
export const RECORD_CUSTOMER_VISIT_FAILURE = 'RECORD_CUSTOMER_VISIT_FAILURE';

export const BULK_IMPORT_CUSTOMERS_REQUEST = 'BULK_IMPORT_CUSTOMERS_REQUEST';
export const BULK_IMPORT_CUSTOMERS_SUCCESS = 'BULK_IMPORT_CUSTOMERS_SUCCESS';
export const BULK_IMPORT_CUSTOMERS_FAILURE = 'BULK_IMPORT_CUSTOMERS_FAILURE';

// Action Creators

// Add customer
export const addCustomerAction = (customerData) => async (dispatch) => {
  dispatch({ type: ADD_CUSTOMER_REQUEST });
  try {
    const response = await addCustomer(customerData);
    dispatch({
      type: ADD_CUSTOMER_SUCCESS,
      payload: response.data || response
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    dispatch({
      type: ADD_CUSTOMER_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Get my customers
export const getMyCustomersAction = () => async (dispatch) => {
  dispatch({ type: GET_MY_CUSTOMERS_REQUEST });
  try {
    const response = await getMyCustomers();
    const customerData = response.data || response;
    dispatch({
      type: GET_MY_CUSTOMERS_SUCCESS,
      payload: customerData
    });
    return { success: true, data: customerData };
  } catch (error) {
    dispatch({
      type: GET_MY_CUSTOMERS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Get customer by ID
export const getCustomerByIdAction = (customerId) => async (dispatch) => {
  dispatch({ type: GET_CUSTOMER_BY_ID_REQUEST });
  try {
    const response = await getCustomerById(customerId);
    const customerData = response.data || response;
    dispatch({
      type: GET_CUSTOMER_BY_ID_SUCCESS,
      payload: customerData
    });
    return { success: true, data: customerData };
  } catch (error) {
    dispatch({
      type: GET_CUSTOMER_BY_ID_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Update customer
export const updateCustomerAction = (customerId, customerData) => async (dispatch) => {
  dispatch({ type: UPDATE_CUSTOMER_REQUEST });
  try {
    const response = await updateCustomer(customerId, customerData);
    // Backend returns: { success: true, message: '...', data: customerData }
    // Extract the actual customer data (same pattern as addCustomerAction)
    const updatedCustomer = response.data || response;
    dispatch({
      type: UPDATE_CUSTOMER_SUCCESS,
      payload: { customerId, customer: updatedCustomer }
    });
    return { success: true, data: updatedCustomer };
  } catch (error) {
    dispatch({
      type: UPDATE_CUSTOMER_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Remove customer
export const removeCustomerAction = (customerId) => async (dispatch) => {
  dispatch({ type: REMOVE_CUSTOMER_REQUEST });
  try {
    const response = await removeCustomer(customerId);
    dispatch({
      type: REMOVE_CUSTOMER_SUCCESS,
      payload: customerId
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    dispatch({
      type: REMOVE_CUSTOMER_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Record customer visit
export const recordCustomerVisitAction = (customerId, visitData) => async (dispatch) => {
  dispatch({ type: RECORD_CUSTOMER_VISIT_REQUEST });
  try {
    const response = await recordCustomerVisit(customerId, visitData);
    const visitRecord = response.data || response;
    dispatch({
      type: RECORD_CUSTOMER_VISIT_SUCCESS,
      payload: { customerId, visit: visitRecord }
    });
    return { success: true, data: visitRecord };
  } catch (error) {
    dispatch({
      type: RECORD_CUSTOMER_VISIT_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Bulk import customers
export const bulkImportCustomersAction = (customersArray) => async (dispatch) => {
  dispatch({ type: BULK_IMPORT_CUSTOMERS_REQUEST });
  try {
    const response = await bulkImportCustomers(customersArray);
    const importResult = response.data || response;
    dispatch({
      type: BULK_IMPORT_CUSTOMERS_SUCCESS,
      payload: importResult
    });
    return { success: true, data: importResult };
  } catch (error) {
    dispatch({
      type: BULK_IMPORT_CUSTOMERS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};
