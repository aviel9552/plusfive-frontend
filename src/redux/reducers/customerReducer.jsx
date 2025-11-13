import {
  ADD_CUSTOMER_REQUEST,
  ADD_CUSTOMER_SUCCESS,
  ADD_CUSTOMER_FAILURE,
  GET_MY_CUSTOMERS_REQUEST,
  GET_MY_CUSTOMERS_SUCCESS,
  GET_MY_CUSTOMERS_FAILURE,
  GET_CUSTOMER_BY_ID_REQUEST,
  GET_CUSTOMER_BY_ID_SUCCESS,
  GET_CUSTOMER_BY_ID_FAILURE,
  UPDATE_CUSTOMER_REQUEST,
  UPDATE_CUSTOMER_SUCCESS,
  UPDATE_CUSTOMER_FAILURE,
  REMOVE_CUSTOMER_REQUEST,
  REMOVE_CUSTOMER_SUCCESS,
  REMOVE_CUSTOMER_FAILURE,
  RECORD_CUSTOMER_VISIT_REQUEST,
  RECORD_CUSTOMER_VISIT_SUCCESS,
  RECORD_CUSTOMER_VISIT_FAILURE
} from '../actions/customerActions';

const initialState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null
};

const customerReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==== ADD CUSTOMER ====
    case ADD_CUSTOMER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case ADD_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: [...state.customers, action.payload],
        error: null
      };

    case ADD_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== GET MY CUSTOMERS ====
    case GET_MY_CUSTOMERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_MY_CUSTOMERS_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: action.payload,
        error: null
      };

    case GET_MY_CUSTOMERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== GET CUSTOMER BY ID ====
    case GET_CUSTOMER_BY_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_CUSTOMER_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedCustomer: action.payload,
        error: null
      };

    case GET_CUSTOMER_BY_ID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== UPDATE CUSTOMER ====
    case UPDATE_CUSTOMER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case UPDATE_CUSTOMER_SUCCESS:
      const { customerId, customer } = action.payload;
      return {
        ...state,
        loading: false,
        customers: state.customers.map(c => 
          c.id === customerId ? customer : c
        ),
        selectedCustomer: state.selectedCustomer?.id === customerId ? customer : state.selectedCustomer,
        error: null
      };

    case UPDATE_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== REMOVE CUSTOMER ====
    case REMOVE_CUSTOMER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case REMOVE_CUSTOMER_SUCCESS:
      const removedCustomerId = action.payload;
      return {
        ...state,
        loading: false,
        customers: state.customers.filter(c => c.id !== removedCustomerId),
        selectedCustomer: state.selectedCustomer?.id === removedCustomerId ? null : state.selectedCustomer,
        error: null
      };

    case REMOVE_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ==== RECORD CUSTOMER VISIT ====
    case RECORD_CUSTOMER_VISIT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case RECORD_CUSTOMER_VISIT_SUCCESS:
      const { customerId: visitCustomerId, visit } = action.payload;
      return {
        ...state,
        loading: false,
        customers: state.customers.map(c => 
          c.id === visitCustomerId 
            ? { ...c, visits: [...(c.visits || []), visit] }
            : c
        ),
        error: null
      };

    case RECORD_CUSTOMER_VISIT_FAILURE:
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

export default customerReducer;
