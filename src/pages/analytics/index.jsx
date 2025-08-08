import React from 'react'
import { AdminAnalyticsMonthlyPerformance, AdminAnalyticsRevenueAndCustomerStatus, AdminAnalyticsSecontChart, AdminLTVGrothChart, AnalyticsMonthlyPerformance, AnalyticsRevenueAndCustomerStatus, AnalyticsSecontChart, LTVGrothChart } from '../../components'
import { useLanguage } from '../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../utils/translations';

function Analytics() {
  const { language } = useLanguage();
  const t = getAdminAnalyticsTranslations(language);
  return (
    <div>
      {/* <AnalyticsMonthlyPerformance />
      <h2 className='text-2xl font-bold mt-10 dark:text-white'>Analytics</h2>
      <AnalyticsRevenueAndCustomerStatus />
      <AnalyticsSecontChart />
      <LTVGrothChart /> */}
      <AdminAnalyticsMonthlyPerformance />
      <h2 className='text-2xl font-bold mt-10 dark:text-white'>{t.analytics}</h2>
      <AdminAnalyticsRevenueAndCustomerStatus />
      <AdminAnalyticsSecontChart />
      <AdminLTVGrothChart />
    </div>
  )
}

export default Analytics
