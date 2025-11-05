import React, { useEffect, useState } from 'react';
import {
  AdminAnalyticsMonthlyPerformance,
  AdminAnalyticsRevenueAndCustomerStatus,
  AdminAnalyticsSecontChart,
  AdminLTVGrothChart,
} from '../../components/analytics'; // שים לב לנתיב המדויק אצלך
import PageLoader from '../../components/commonComponent/PageLoader';
import { useLanguage } from '../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../utils/translations';

function Analytics() {
  const { language } = useLanguage();
  const t = getAdminAnalyticsTranslations(language);

  // דגל מוכנות של כל הדף
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // כאן טוענים את כל הדאטה הדרוש לדף במקביל.
    // החלף ל-fetchים האמיתיים שלך (או לקריאות services).
    async function loadAll() {
      try {
        await Promise.allSettled([
          // fetch('/api/analytics/revenue').then(r => r.json()),
          // fetch('/api/analytics/ratings').then(r => r.json()),
          // fetch('/api/analytics/ltv').then(r => r.json()),
        ]);
      } finally {
        setIsReady(true); // מציג את הדף רק כשכולם סיימו
      }
    }
    loadAll();
  }, []);

  return (
    <PageLoader isReady={isReady} minLoadTime={600}>
      <div className="space-y-10">
        <AdminAnalyticsRevenueAndCustomerStatus />
        <AdminAnalyticsSecontChart />
        <AdminLTVGrothChart />
        <AdminAnalyticsMonthlyPerformance />
      </div>
    </PageLoader>
  );
}

export default Analytics;
