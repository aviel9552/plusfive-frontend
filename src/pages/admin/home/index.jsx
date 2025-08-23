import React, { useEffect } from 'react'
import { AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, AdminReferrals } from "../../../components";
import { useAdminData } from '../../../hooks/useAdminData';

function AdminHome() {
  const { fetchAllData } = useAdminData();

  useEffect(() => {
    fetchAllData(); // This will fetch all admin data including dashboard overview
  }, [fetchAllData]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-[24px]">
        <AdminMonthlyPerformance />
        <AdminRevenueImpactCustomerStatus />
      </div>
      <AdminReferrals />
    </div>
  )
}

export default AdminHome
