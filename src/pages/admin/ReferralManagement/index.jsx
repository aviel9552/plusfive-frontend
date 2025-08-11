import React from 'react'
import { AdminReferralCode, AdminReferralReport, AdminReferralsTable } from '../../../components'

function ReferralManagement() {
  return (
    <div>
      <AdminReferralCode />
      <div className='mt-10 border border-gray-200 dark:border-customBorderColor rounded-2xl p-6 dark:bg-customBrown bg-white dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
      <AdminReferralReport />
      </div>
      <AdminReferralsTable />
    </div>
  )
}

export default ReferralManagement
