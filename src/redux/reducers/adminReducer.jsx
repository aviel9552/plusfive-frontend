import {
  ADMIN_MONTHLY_PERFORMANCE_REQUEST,
  ADMIN_MONTHLY_PERFORMANCE_SUCCESS,
  ADMIN_MONTHLY_PERFORMANCE_FAILURE,
  ADMIN_REVENUE_IMPACT_REQUEST,
  ADMIN_REVENUE_IMPACT_SUCCESS,
  ADMIN_REVENUE_IMPACT_FAILURE,
  ADMIN_CUSTOMER_STATUS_REQUEST,
  ADMIN_CUSTOMER_STATUS_SUCCESS,
  ADMIN_CUSTOMER_STATUS_FAILURE,
  ADMIN_SUMMARY_REQUEST,
  ADMIN_SUMMARY_SUCCESS,
  ADMIN_SUMMARY_FAILURE,
  ADMIN_DASHBOARD_OVERVIEW_REQUEST,
  ADMIN_DASHBOARD_OVERVIEW_SUCCESS,
  ADMIN_DASHBOARD_OVERVIEW_FAILURE
} from '../actions/adminActions';

const initialState = {
  monthlyPerformance: {
    data: null,
    loading: false,
    error: null
  },
  revenueImpact: {
    data: null,
    loading: false,
    error: null
  },
  customerStatus: {
    data: null,
    loading: false,
    error: null
  },
  adminSummary: {
    data: null,
    loading: false,
    error: null
  },
  dashboardOverview: {
    data: null,
    loading: false,
    error: null
  }
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADMIN_MONTHLY_PERFORMANCE_REQUEST:
      return {
        ...state,
        monthlyPerformance: {
          ...state.monthlyPerformance,
          loading: true,
          error: null
        }
      };
    case ADMIN_MONTHLY_PERFORMANCE_SUCCESS:
      return {
        ...state,
        monthlyPerformance: {
          ...state.monthlyPerformance,
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case ADMIN_MONTHLY_PERFORMANCE_FAILURE:
      return {
        ...state,
        monthlyPerformance: {
          ...state.monthlyPerformance,
          loading: false,
          error: action.payload
        }
      };

    case ADMIN_REVENUE_IMPACT_REQUEST:
      return {
        ...state,
        revenueImpact: {
          ...state.revenueImpact,
          loading: true,
          error: null
        }
      };
    case ADMIN_REVENUE_IMPACT_SUCCESS:
      return {
        ...state,
        revenueImpact: {
          ...state.revenueImpact,
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case ADMIN_REVENUE_IMPACT_FAILURE:
      return {
        ...state,
        revenueImpact: {
          ...state.revenueImpact,
          loading: false,
          error: action.payload
        }
      };

    case ADMIN_CUSTOMER_STATUS_REQUEST:
      return {
        ...state,
        customerStatus: {
          ...state.customerStatus,
          loading: true,
          error: null
        }
      };
    case ADMIN_CUSTOMER_STATUS_SUCCESS:
      return {
        ...state,
        customerStatus: {
          ...state.customerStatus,
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case ADMIN_CUSTOMER_STATUS_FAILURE:
      return {
        ...state,
        customerStatus: {
          ...state.customerStatus,
          loading: false,
          error: action.payload
        }
      };

    case ADMIN_SUMMARY_REQUEST:
      return {
        ...state,
        adminSummary: {
          ...state.adminSummary,
          loading: true,
          error: null
        }
      };
    case ADMIN_SUMMARY_SUCCESS:
      return {
        ...state,
        adminSummary: {
          ...state.adminSummary,
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case ADMIN_SUMMARY_FAILURE:
      return {
        ...state,
        adminSummary: {
          ...state.adminSummary,
          loading: false,
          error: action.payload
        }
      };

    case ADMIN_DASHBOARD_OVERVIEW_REQUEST:
      return {
        ...state,
        dashboardOverview: {
          ...state.dashboardOverview,
          loading: true,
          error: null
        }
      };
    case ADMIN_DASHBOARD_OVERVIEW_SUCCESS:
      return {
        ...state,
        dashboardOverview: {
          ...state.dashboardOverview,
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case ADMIN_DASHBOARD_OVERVIEW_FAILURE:
      return {
        ...state,
        dashboardOverview: {
          ...state.dashboardOverview,
          loading: false,
          error: action.payload
        }
      };

    default:
      return state;
  }
};

export default adminReducer;
