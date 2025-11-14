import React from 'react';
import { StatSingleBarChart, StatPieChart } from '../index';

// ברירות מחדל (רק אם ההורה לא מספק דאטה)
const DEFAULT_FILTERS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Month', value: 'thisMonth' },
];

const DEFAULT_DATA_MAP = {
  monthly: [
    { month: 'Jan', value: 32 },
    { month: 'Feb', value: 25 },
    { month: 'Mar', value: 42 },
    { month: 'Apr', value: 18 },
    { month: 'May', value: 28 },
    { month: 'Jun', value: 25 },
    { month: 'Jul', value: 32 },
  ],
  weekly: [
    { month: 'W1', value: 10 },
    { month: 'W2', value: 18 },
    { month: 'W3', value: 22 },
    { month: 'W4', value: 15 },
  ],
  lastMonth: [
    { month: 'Week 1', value: 8 },
    { month: 'Week 2', value: 12 },
    { month: 'Week 3', value: 16 },
    { month: 'Week 4', value: 10 },
  ],
  thisMonth: [
    { month: 'Week 1', value: 14 },
    { month: 'Week 2', value: 18 },
    { month: 'Week 3', value: 20 },
    { month: 'Week 4', value: 16 },
  ],
};

const DEFAULT_PIE = [
  { name: 'New',       value: 120, percentage: '20%', color: '#ff257c' },
  { name: 'Active',    value: 680, percentage: '22%', color: '#ff4e94' },
  { name: 'At Risk',   value: 75,  percentage: '10%', color: '#ff7db1' },
  { name: 'Lost',      value: 58,  percentage: '8%',  color: '#ffb7d4' },
  { name: 'Recovered', value: 240, percentage: '15%', color: '#ffd5e6' },
];

function AnalyticsRevenueAndCustomerStatus({
  isReady = false,
  barDataMap,
  filters,
  pieData,
}) {
  // לא מרנדר עד שהעמוד מוכן — כך לא נראה לודרים פנימיים
  if (!isReady) return null;

  const _filters = filters ?? DEFAULT_FILTERS;
  const _barDataMap = barDataMap ?? DEFAULT_DATA_MAP;
  const _pieData = pieData ?? DEFAULT_PIE;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-ttcommons mt-6">
      <StatSingleBarChart
        title="Revenue Impact"
        dataMap={_barDataMap}
        filters={_filters}
        // אם ל-StatSingleBarChart יש prop שמבטל לודר פנימי, תעביר אותו כאן (למשל):
        // isReady={isReady} or disableLoading
      />
      <StatPieChart
        title="Customer Status Breakdown"
        data={_pieData}
        // כנ״ל: isReady={isReady} / disableLoading
      />
    </div>
  );
}

export default AnalyticsRevenueAndCustomerStatus;
