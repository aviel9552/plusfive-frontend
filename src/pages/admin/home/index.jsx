import React from 'react'
import { AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, AdminReferrals } from "../../../components";

function AdminHome() {
  return (
    <div className="space-y-4">
      <AdminMonthlyPerformance />
      <AdminRevenueImpactCustomerStatus />
      <AdminReferrals />
    </div>
  )
}

export default AdminHome
