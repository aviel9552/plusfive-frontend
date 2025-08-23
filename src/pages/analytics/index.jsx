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
      <AdminAnalyticsMonthlyPerformance />
      <div className='flex flex-col gap-[16px]'>
        <h2 className='text-2xl font-bold mt-10 dark:text-white'>{t.analytics}</h2>
        <AdminAnalyticsRevenueAndCustomerStatus />
      </div>
      <AdminAnalyticsSecontChart />
      <AdminLTVGrothChart />
      
      {/* QR Code Analytics Section */}
      <div className="mt-16">
        <h2 className='text-2xl font-bold mb-6 dark:text-white'>QR Code Analytics</h2>
        
        {/* Debug Test Component */}
        <div className="mb-8">
          <h3 className='text-lg font-semibold mb-4 dark:text-white'>🔧 Debug Test</h3>
          <TestQRAnalytics />
        </div>
        
        <EnhancedQRAnalyticsDashboard />
      </div>
    </div>
  )
}

export default Analytics
