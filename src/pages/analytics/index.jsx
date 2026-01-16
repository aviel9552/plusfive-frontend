import React, { useState, useEffect } from 'react';
import { AdminAnalyticsMonthlyPerformance, AdminAnalyticsRevenueAndCustomerStatus, AdminAnalyticsSecontChart, AdminLTVGrothChart } from '../../components';
import { useLanguage } from '../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../utils/translations';
import CommonLoader from '../../components/commonComponent/CommonLoader';

function Analytics() {
  const { language } = useLanguage();
  const t = getAdminAnalyticsTranslations(language);
  
  const [loadingStates, setLoadingStates] = useState({
    monthlyPerformance: true,
    revenueAndCustomerStatus: true,
    secondChart: true,
    ltvChart: true
  });

  const [initialLoad, setInitialLoad] = useState(true);

  const isPageLoading = Object.values(loadingStates).some(loading => loading === true);

  // After initial mount, give components time to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Safety timeout - if still loading after 10 seconds, show content anyway
  useEffect(() => {
    if (isPageLoading && !initialLoad) {
      const safetyTimer = setTimeout(() => {
        console.warn('Analytics page: Force showing content after timeout');
        setLoadingStates({
          monthlyPerformance: false,
          revenueAndCustomerStatus: false,
          secondChart: false,
          ltvChart: false
        });
      }, 10000);

      return () => clearTimeout(safetyTimer);
    }
  }, [isPageLoading, initialLoad]);

  return (
    <div className="w-full min-h-screen relative">
      {/* Show loader only during initial load */}
      {initialLoad && isPageLoading && (
        <div className="fixed inset-0 bg-white dark:bg-customBlack flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <CommonLoader />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {language === 'he' ? 'טוען סטטיסטיקות...' : 'Loading statistics...'}
            </p>
          </div>
        </div>
      )}
      
      {/* Always show content - components handle their own loading states */}
      <div className="w-full">
        <AdminAnalyticsMonthlyPerformance 
          onLoadingChange={(loading) => {
            setLoadingStates(prev => ({ ...prev, monthlyPerformance: loading }));
          }}
        />
        <div className='mt-10' />
        <AdminAnalyticsRevenueAndCustomerStatus 
          onLoadingChange={(loading) => {
            setLoadingStates(prev => ({ ...prev, revenueAndCustomerStatus: loading }));
          }}
        />
        <AdminAnalyticsSecontChart 
          onLoadingChange={(loading) => {
            setLoadingStates(prev => ({ ...prev, secondChart: loading }));
          }}
        />
        <AdminLTVGrothChart 
          onLoadingChange={(loading) => {
            setLoadingStates(prev => ({ ...prev, ltvChart: loading }));
          }}
        />
      </div>
    </div>
  );
}

export default Analytics;
