import {
  getAdminMonthlyPerformance,
  getAdminRevenueImpact,
  getAdminCustomerStatus,
  getAdminSummary,
  getAdminDashboardOverview
} from '../services/adminServices';

// Action Types
export const ADMIN_MONTHLY_PERFORMANCE_REQUEST = 'ADMIN_MONTHLY_PERFORMANCE_REQUEST';
export const ADMIN_MONTHLY_PERFORMANCE_SUCCESS = 'ADMIN_MONTHLY_PERFORMANCE_SUCCESS';
export const ADMIN_MONTHLY_PERFORMANCE_FAILURE = 'ADMIN_MONTHLY_PERFORMANCE_FAILURE';

export const ADMIN_REVENUE_IMPACT_REQUEST = 'ADMIN_REVENUE_IMPACT_REQUEST';
export const ADMIN_REVENUE_IMPACT_SUCCESS = 'ADMIN_REVENUE_IMPACT_SUCCESS';
export const ADMIN_REVENUE_IMPACT_FAILURE = 'ADMIN_REVENUE_IMPACT_FAILURE';

export const ADMIN_CUSTOMER_STATUS_REQUEST = 'ADMIN_CUSTOMER_STATUS_REQUEST';
export const ADMIN_CUSTOMER_STATUS_SUCCESS = 'ADMIN_CUSTOMER_STATUS_SUCCESS';
export const ADMIN_CUSTOMER_STATUS_FAILURE = 'ADMIN_CUSTOMER_STATUS_FAILURE';

export const ADMIN_SUMMARY_REQUEST = 'ADMIN_SUMMARY_REQUEST';
export const ADMIN_SUMMARY_SUCCESS = 'ADMIN_SUMMARY_SUCCESS';
export const ADMIN_SUMMARY_FAILURE = 'ADMIN_SUMMARY_FAILURE';

export const ADMIN_DASHBOARD_OVERVIEW_REQUEST = 'ADMIN_DASHBOARD_OVERVIEW_REQUEST';
export const ADMIN_DASHBOARD_OVERVIEW_SUCCESS = 'ADMIN_DASHBOARD_OVERVIEW_SUCCESS';
export const ADMIN_DASHBOARD_OVERVIEW_FAILURE = 'ADMIN_DASHBOARD_OVERVIEW_FAILURE';

// Action Creators
export const fetchAdminMonthlyPerformance = (month, year) => async (dispatch) => {
  dispatch({ type: ADMIN_MONTHLY_PERFORMANCE_REQUEST });
  try {
    const response = await getAdminMonthlyPerformance(month, year);
    dispatch({
      type: ADMIN_MONTHLY_PERFORMANCE_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    console.error('Error fetching monthly performance:', error);
    dispatch({
      type: ADMIN_MONTHLY_PERFORMANCE_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch monthly performance'
    });
  }
};

export const fetchAdminRevenueImpact = (months) => async (dispatch) => {
  dispatch({ type: ADMIN_REVENUE_IMPACT_REQUEST });
  try {
    const response = await getAdminRevenueImpact(months);
    dispatch({
      type: ADMIN_REVENUE_IMPACT_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    console.error('Error fetching revenue impact:', error);
    dispatch({
      type: ADMIN_REVENUE_IMPACT_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch revenue impact'
    });
  }
};

export const fetchAdminCustomerStatus = () => async (dispatch) => {
  dispatch({ type: ADMIN_CUSTOMER_STATUS_REQUEST });
  try {
    const response = await getAdminCustomerStatus();
    dispatch({
      type: ADMIN_CUSTOMER_STATUS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    console.error('Error fetching customer status:', error);
    dispatch({
      type: ADMIN_CUSTOMER_STATUS_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch customer status'
    });
  }
};

export const fetchAdminSummary = () => async (dispatch) => {
  dispatch({ type: ADMIN_SUMMARY_REQUEST });
  try {
    const response = await getAdminSummary();
    dispatch({
      type: ADMIN_SUMMARY_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    console.error('Error fetching admin summary:', error);
    dispatch({
      type: ADMIN_SUMMARY_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch admin summary'
    });
  }
};

export const fetchAdminDashboardOverview = (month, year, months) => async (dispatch) => {
  dispatch({ type: ADMIN_DASHBOARD_OVERVIEW_REQUEST });
  try {
    const response = await getAdminDashboardOverview(month, year, months);
    dispatch({
      type: ADMIN_DASHBOARD_OVERVIEW_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    dispatch({
      type: ADMIN_DASHBOARD_OVERVIEW_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch dashboard overview'
    });
  }
};
