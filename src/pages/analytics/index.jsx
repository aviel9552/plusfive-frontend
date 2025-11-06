import React, { useEffect, useState } from 'react';
import {
  AdminAnalyticsMonthlyPerformance,
  AdminAnalyticsRevenueAndCustomerStatus,
  AdminAnalyticsSecontChart,
  AdminLTVGrothChart,
} from '../../components';
import PageLoader from '../../components/commonComponent/PageLoader';

export default function Analytics() {
  const [isReady, setIsReady] = useState(false);
  const [data, setData] = useState({ revenue: null, rating: null, ltv: null, cards: null });

  useEffect(() => {
    (async () => {
      try {
        const [revenue, rating, ltv, cards] = await Promise.all([
          fetch('/api/analytics/revenue').then(r => r.json()),
          fetch('/api/analytics/rating').then(r => r.json()),
          fetch('/api/analytics/ltv').then(r => r.json()),
          fetch('/api/analytics/cards').then(r => r.json()),
        ]);
        setData({ revenue, rating, ltv, cards });
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  return (
    <PageLoader isReady={isReady} minLoadTime={600}>
      {isReady && (
        <div className="space-y-10">
          <AdminAnalyticsMonthlyPerformance data={data.cards} />
          <AdminAnalyticsRevenueAndCustomerStatus data={data.revenue} />
          <AdminAnalyticsSecontChart data={data.rating} />
          <AdminLTVGrothChart data={data.ltv} />
        </div>
      )}
    </PageLoader>
  );
}
