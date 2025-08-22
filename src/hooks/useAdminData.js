import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminMonthlyPerformance,
  fetchAdminRevenueImpact,
  fetchAdminCustomerStatus,
  fetchAdminSummary,
  fetchAdminDashboardOverview
} from '../redux/actions/adminActions';

export const useAdminData = () => {
  const dispatch = useDispatch();
  const adminState = useSelector((state) => state.admin);

  // Use useCallback to prevent infinite re-renders
  const fetchAllData = useCallback((month, year, months = 6) => {
    dispatch(fetchAdminDashboardOverview(month, year, months));
  }, [dispatch]);

  const fetchMonthlyPerformance = useCallback((month, year) => {
    dispatch(fetchAdminMonthlyPerformance(month, year));
  }, [dispatch]);

  const fetchRevenueImpact = useCallback((months = 6) => {
    dispatch(fetchAdminRevenueImpact(months));
  }, [dispatch]);

  const fetchCustomerStatus = useCallback(() => {
    dispatch(fetchAdminCustomerStatus());
  }, [dispatch]);

  const fetchSummary = useCallback(() => {
    dispatch(fetchAdminSummary());
  }, [dispatch]);

  return {
    // State
    monthlyPerformance: adminState.monthlyPerformance,
    revenueImpact: adminState.revenueImpact,
    customerStatus: adminState.customerStatus,
    adminSummary: adminState.adminSummary,
    dashboardOverview: adminState.dashboardOverview,
    
    // Actions
    fetchAllData,
    fetchMonthlyPerformance,
    fetchRevenueImpact,
    fetchCustomerStatus,
    fetchSummary
  };
};
