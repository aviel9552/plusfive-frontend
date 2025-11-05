import React from 'react'
import { AdminAnalyticsMonthlyPerformance, AdminAnalyticsRevenueAndCustomerStatus, AdminAnalyticsSecontChart, AdminLTVGrothChart, AnalyticsMonthlyPerformance, AnalyticsRevenueAndCustomerStatus, AnalyticsSecontChart, LTVGrothChart } from '../../components'
import { useLanguage } from '../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../utils/translations';
import EnhancedQRAnalyticsDashboard from '../../components/qrManagement/EnhancedQRAnalyticsDashboard';
import TestQRAnalytics from '../../components/qrManagement/TestQRAnalytics';

function Analytics() {
  const { language } = useLanguage();
  const t = getAdminAnalyticsTranslations(language);
  return (
    <div>
      <AdminAnalyticsRevenueAndCustomerStatus />
      <AdminAnalyticsSecontChart />
      <AdminLTVGrothChart />
      <div className='mt-5' />
       <AdminAnalyticsMonthlyPerformance />
      {/* <div className='flex flex-col gap-[16px]'>
        <h2 className='text-[24px] font-bold mt-10 dark:text-white'>{t.analytics}</h2>
      </div> */}
    </div>
  );
}
export default Analytics;

