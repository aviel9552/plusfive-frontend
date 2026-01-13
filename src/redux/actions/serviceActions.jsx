import { 
  getAllServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService, 
  deleteMultipleServices 
} from '../services/serviceService';

// Action Types
export const GET_ALL_SERVICES_REQUEST = 'GET_ALL_SERVICES_REQUEST';
export const GET_ALL_SERVICES_SUCCESS = 'GET_ALL_SERVICES_SUCCESS';
export const GET_ALL_SERVICES_FAILURE = 'GET_ALL_SERVICES_FAILURE';

export const GET_SERVICE_BY_ID_REQUEST = 'GET_SERVICE_BY_ID_REQUEST';
export const GET_SERVICE_BY_ID_SUCCESS = 'GET_SERVICE_BY_ID_SUCCESS';
export const GET_SERVICE_BY_ID_FAILURE = 'GET_SERVICE_BY_ID_FAILURE';

export const CREATE_SERVICE_REQUEST = 'CREATE_SERVICE_REQUEST';
export const CREATE_SERVICE_SUCCESS = 'CREATE_SERVICE_SUCCESS';
export const CREATE_SERVICE_FAILURE = 'CREATE_SERVICE_FAILURE';

export const UPDATE_SERVICE_REQUEST = 'UPDATE_SERVICE_REQUEST';
export const UPDATE_SERVICE_SUCCESS = 'UPDATE_SERVICE_SUCCESS';
export const UPDATE_SERVICE_FAILURE = 'UPDATE_SERVICE_FAILURE';

export const DELETE_SERVICE_REQUEST = 'DELETE_SERVICE_REQUEST';
export const DELETE_SERVICE_SUCCESS = 'DELETE_SERVICE_SUCCESS';
export const DELETE_SERVICE_FAILURE = 'DELETE_SERVICE_FAILURE';

export const DELETE_MULTIPLE_SERVICES_REQUEST = 'DELETE_MULTIPLE_SERVICES_REQUEST';
export const DELETE_MULTIPLE_SERVICES_SUCCESS = 'DELETE_MULTIPLE_SERVICES_SUCCESS';
export const DELETE_MULTIPLE_SERVICES_FAILURE = 'DELETE_MULTIPLE_SERVICES_FAILURE';

// Action Creators

// Get all services
export const getAllServicesAction = () => async (dispatch) => {
  dispatch({ type: GET_ALL_SERVICES_REQUEST });
  try {
    const services = await getAllServices();
    dispatch({
      type: GET_ALL_SERVICES_SUCCESS,
      payload: services
    });
    return { success: true, data: services };
  } catch (error) {
    dispatch({
      type: GET_ALL_SERVICES_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Get service by ID
export const getServiceByIdAction = (serviceId) => async (dispatch) => {
  dispatch({ type: GET_SERVICE_BY_ID_REQUEST });
  try {
    const service = await getServiceById(serviceId);
    dispatch({
      type: GET_SERVICE_BY_ID_SUCCESS,
      payload: service
    });
    return { success: true, data: service };
  } catch (error) {
    dispatch({
      type: GET_SERVICE_BY_ID_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Create service
export const createServiceAction = (serviceData) => async (dispatch) => {
  dispatch({ type: CREATE_SERVICE_REQUEST });
  try {
    const service = await createService(serviceData);
    dispatch({
      type: CREATE_SERVICE_SUCCESS,
      payload: service
    });
    return { success: true, data: service };
  } catch (error) {
    dispatch({
      type: CREATE_SERVICE_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Update service
export const updateServiceAction = (serviceId, serviceData) => async (dispatch) => {
  dispatch({ type: UPDATE_SERVICE_REQUEST });
  try {
    const service = await updateService(serviceId, serviceData);
    dispatch({
      type: UPDATE_SERVICE_SUCCESS,
      payload: { serviceId, service }
    });
    return { success: true, data: service };
  } catch (error) {
    dispatch({
      type: UPDATE_SERVICE_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Delete service
export const deleteServiceAction = (serviceId) => async (dispatch) => {
  dispatch({ type: DELETE_SERVICE_REQUEST });
  try {
    await deleteService(serviceId);
    dispatch({
      type: DELETE_SERVICE_SUCCESS,
      payload: serviceId
    });
    return { success: true };
  } catch (error) {
    dispatch({
      type: DELETE_SERVICE_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Delete multiple services
export const deleteMultipleServicesAction = (serviceIds) => async (dispatch) => {
  dispatch({ type: DELETE_MULTIPLE_SERVICES_REQUEST });
  try {
    await deleteMultipleServices(serviceIds);
    dispatch({
      type: DELETE_MULTIPLE_SERVICES_SUCCESS,
      payload: serviceIds
    });
    return { success: true };
  } catch (error) {
    dispatch({
      type: DELETE_MULTIPLE_SERVICES_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};
