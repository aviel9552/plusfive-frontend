import {
  GET_ALL_SERVICES_REQUEST,
  GET_ALL_SERVICES_SUCCESS,
  GET_ALL_SERVICES_FAILURE,
  GET_SERVICE_BY_ID_REQUEST,
  GET_SERVICE_BY_ID_SUCCESS,
  GET_SERVICE_BY_ID_FAILURE,
  CREATE_SERVICE_REQUEST,
  CREATE_SERVICE_SUCCESS,
  CREATE_SERVICE_FAILURE,
  UPDATE_SERVICE_REQUEST,
  UPDATE_SERVICE_SUCCESS,
  UPDATE_SERVICE_FAILURE,
  DELETE_SERVICE_REQUEST,
  DELETE_SERVICE_SUCCESS,
  DELETE_SERVICE_FAILURE,
  DELETE_MULTIPLE_SERVICES_REQUEST,
  DELETE_MULTIPLE_SERVICES_SUCCESS,
  DELETE_MULTIPLE_SERVICES_FAILURE
} from '../actions/serviceActions';

const initialState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null
};

const serviceReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==== GET ALL SERVICES ====
    case GET_ALL_SERVICES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_ALL_SERVICES_SUCCESS:
      return {
        ...state,
        loading: false,
        services: action.payload,
        error: null
      };

    case GET_ALL_SERVICES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== GET SERVICE BY ID ====
    case GET_SERVICE_BY_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_SERVICE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedService: action.payload,
        error: null
      };

    case GET_SERVICE_BY_ID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== CREATE SERVICE ====
    case CREATE_SERVICE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CREATE_SERVICE_SUCCESS:
      return {
        ...state,
        loading: false,
        services: [action.payload, ...state.services],
        error: null
      };

    case CREATE_SERVICE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== UPDATE SERVICE ====
    case UPDATE_SERVICE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case UPDATE_SERVICE_SUCCESS:
      const { serviceId, service } = action.payload;
      return {
        ...state,
        loading: false,
        services: state.services.map(s => 
          s.id === serviceId ? service : s
        ),
        selectedService: state.selectedService?.id === serviceId ? service : state.selectedService,
        error: null
      };

    case UPDATE_SERVICE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== DELETE SERVICE ====
    case DELETE_SERVICE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_SERVICE_SUCCESS:
      const deletedServiceId = action.payload;
      return {
        ...state,
        loading: false,
        services: state.services.filter(s => s.id !== deletedServiceId),
        selectedService: state.selectedService?.id === deletedServiceId ? null : state.selectedService,
        error: null
      };

    case DELETE_SERVICE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== DELETE MULTIPLE SERVICES ====
    case DELETE_MULTIPLE_SERVICES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_MULTIPLE_SERVICES_SUCCESS:
      const deletedServiceIds = action.payload;
      return {
        ...state,
        loading: false,
        services: state.services.filter(s => !deletedServiceIds.includes(s.id)),
        selectedService: deletedServiceIds.includes(state.selectedService?.id) ? null : state.selectedService,
        error: null
      };

    case DELETE_MULTIPLE_SERVICES_FAILURE:
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

export default serviceReducer;
