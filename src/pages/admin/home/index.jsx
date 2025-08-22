import React, { useEffect } from 'react'
import { AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, AdminReferrals } from "../../../components";
import { useAdminData } from '../../../hooks/useAdminData';

function AdminHome() {
  const { fetchAllData } = useAdminData();

  useEffect(() => {
    fetchAllData(); // This will fetch all admin data including dashboard overview
  }, [fetchAllData]);

  return (
    <div className="space-y-4">
      <AdminMonthlyPerformance />
      <AdminRevenueImpactCustomerStatus />
      <AdminReferrals />
    </div>
  )
}

export default AdminHome
