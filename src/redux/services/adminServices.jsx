import apiClient from '../../config/apiClient';

// Admin Dashboard API Services

export const getAdminMonthlyPerformance = async (month, year) => {
  try {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    
    const response = await apiClient.get('/admin-dashboard/monthly-performance', { params });
    return response.data;
  } catch (error) {
    console.error('API Error - Monthly Performance:', error);
    throw error;
  }
};

export const getAdminRevenueImpact = async (months = 6) => {
  try {
    const response = await apiClient.get('/admin-dashboard/revenue-impact', {
      params: { months }
    });
    return response.data;
  } catch (error) {
    console.error('API Error - Revenue Impact:', error);
    throw error;
  }
};

export const getAdminCustomerStatus = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/customer-status');
    return response.data;
  } catch (error) {
    console.error('API Error - Customer Status:', error);
    throw error;
  }
};

export const getAdminSummary = async () => {
  try {
    const response = await apiClient.get('/admin-dashboard/admin-summary');
    return response.data;
  } catch (error) {
    console.error('API Error - Admin Summary:', error);
    throw error;
  }
};

export const getAdminDashboardOverview = async (month, year, months = 6) => {
  try {
    const params = { months };
    if (month) params.month = month;
    if (year) params.year = year;
    
    const response = await apiClient.get('/admin-dashboard/overview', { params });
    return response.data;
  } catch (error) {
    console.error('API Error - Dashboard Overview:', error);
    throw error;
  }
};
