import React from 'react'
import { AdminAnalyticsMonthlyPerformance, AdminAnalyticsRevenueAndCustomerStatus, AdminAnalyticsSecontChart, AdminLTVGrothChart } from '../../../components';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../../utils/translations';

function Analytics() {
  const { language } = useLanguage();
  const t = getAdminAnalyticsTranslations(language);

  return (
    <div>
      <div className='mt-10' />
        <AdminAnalyticsRevenueAndCustomerStatus />
      <AdminAnalyticsSecontChart />
      <AdminLTVGrothChart />
      <AdminAnalyticsMonthlyPerformance />
      {/* <div className='flex flex-col gap-[16px]'>
        <h2 className='text-[24px] font-bold mt-10 dark:text-white'>{t.analytics}</h2>
      </div> */}
    </div>
  )
}

export default Analytics
