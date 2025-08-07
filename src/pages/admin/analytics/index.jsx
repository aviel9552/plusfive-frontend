import React from 'react'
import { AdminAnalyticsMonthlyPerformance, AdminAnalyticsRevenueAndCustomerStatus, AdminAnalyticsSecontChart, AdminLTVGrothChart } from '../../../components';
import { useLanguage } from '../../../context/LanguageContext';
import enTranslations from '../../../i18/en.json';
import heTranslations from '../../../i18/he.json';

function Analytics() {
  const { language } = useLanguage();
  const translations = language === 'he' ? heTranslations : enTranslations;
  const t = translations.adminAnalytics;

  return (
    <div>
      <AdminAnalyticsMonthlyPerformance />
      <h2 className='text-2xl font-bold mt-10 dark:text-white'>{t.analytics}</h2>
      <AdminAnalyticsRevenueAndCustomerStatus />
      <AdminAnalyticsSecontChart />
      <AdminLTVGrothChart />
    </div>
  )
}

export default Analytics
