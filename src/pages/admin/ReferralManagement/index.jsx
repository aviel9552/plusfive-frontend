import React from 'react'
import { ReferralCode, ReferralReport, ReferralsTable } from '../../../components'

function ReferralManagement() {
  return (
    <div>
      <ReferralCode />
      <div className='mt-10 border border-gray-200 dark:border-customBorderColor rounded-2xl p-6 dark:bg-customBrown bg-white dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
      <ReferralReport />
      </div>
      <ReferralsTable />
    </div>
  )
}

export default ReferralManagement
