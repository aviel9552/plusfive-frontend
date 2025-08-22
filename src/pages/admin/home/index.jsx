import React from 'react'
import { AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, AdminReferrals } from "../../../components";

function AdminHome() {
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
