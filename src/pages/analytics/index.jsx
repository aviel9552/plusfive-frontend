import React, { useEffect, useState } from 'react';
import {
  AdminAnalyticsMonthlyPerformance,
  AdminAnalyticsRevenueAndCustomerStatus,
  AdminAnalyticsSecontChart,
  AdminLTVGrothChart,
} from '../../components/analytics';
import PageLoader from '../../components/commonComponent/PageLoader';

export default function Analytics() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadAll() {
      try {
        // שים כאן את ה-fetchים האמיתיים (אם יש),
        // או השאר ריק אם אין כרגע קריאות
        await Promise.allSettled([]);
      } finally {
        setIsReady(true);
      }
    }
    loadAll();
  }, []);

  return (
    <PageLoader isReady={isReady} minLoadTime={600}>
      {/* הילדים יופיעו רק כשהכול מוכן */}
      {isReady && (
        <div className="space-y-10">
          <AdminAnalyticsRevenueAndCustomerStatus />
          <AdminAnalyticsSecontChart />
          <AdminLTVGrothChart />
          <AdminAnalyticsMonthlyPerformance />
        </div>
      )}
    </PageLoader>
  );
}

