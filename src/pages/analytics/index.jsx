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
    {/* הגרפים למעלה */}
    <div className="mt-10">
      <AdminAnalyticsRevenueAndCustomerStatus />
      <AdminAnalyticsSecondChart />
      <AdminLTVGrothChart />
    </div>

    {/* הכרטיסיות למטה */}
    <div className="mt-10">
      <AdminAnalyticsMonthlyPerformance />
    </div>
  </div>
);


export default Analytics
