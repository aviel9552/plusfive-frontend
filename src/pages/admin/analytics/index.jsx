import React, { useState, useEffect } from 'react'
import { AdminAnalyticsMonthlyPerformance, AdminAnalyticsRevenueAndCustomerStatus, AdminAnalyticsSecontChart, AdminLTVGrothChart } from '../../../components';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../../utils/translations';
import CommonLoader from '../../../components/commonComponent/CommonLoader';

function Analytics() {
  const { language } = useLanguage();
  const t = getAdminAnalyticsTranslations(language);
  
  const [loadingStates, setLoadingStates] = useState({
    monthlyPerformance: true,
    revenueAndCustomerStatus: true,
    secondChart: true,
    ltvChart: true
  });

  const isPageLoading = Object.values(loadingStates).some(loading => loading === true);

  return (
    <>
      {isPageLoading && (
        <div className="fixed inset-0 bg-white dark:bg-customBlack flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <CommonLoader />
          </div>
        </div>
      )}
      <div style={{ opacity: isPageLoading ? 0 : 1, transition: 'opacity 0.3s' }}>
        <AdminAnalyticsMonthlyPerformance 
          onLoadingChange={(loading) => setLoadingStates(prev => ({ ...prev, monthlyPerformance: loading }))}
        />
        <div className='mt-10' />
        <AdminAnalyticsRevenueAndCustomerStatus 
          onLoadingChange={(loading) => setLoadingStates(prev => ({ ...prev, revenueAndCustomerStatus: loading }))}
        />
        <AdminAnalyticsSecontChart 
          onLoadingChange={(loading) => setLoadingStates(prev => ({ ...prev, secondChart: loading }))}
        />
        <AdminLTVGrothChart 
          onLoadingChange={(loading) => setLoadingStates(prev => ({ ...prev, ltvChart: loading }))}
        />
      </div>
    </>
  )
}

export default Analytics
