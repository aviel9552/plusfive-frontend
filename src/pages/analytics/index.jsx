import React from 'react'
import { AnalyticsMonthlyPerformance, AnalyticsRevenueAndCustomerStatus, AnalyticsSecontChart, LTVGrothChart } from '../../components'

function Analytics() {
  return (
    <div>
      <AnalyticsMonthlyPerformance />
      <h2 className='text-2xl font-bold mt-10 dark:text-white'>Analytics</h2>
      <AnalyticsRevenueAndCustomerStatus />
      <AnalyticsSecontChart />
      <LTVGrothChart />
    </div>
  )
}

export default Analytics
