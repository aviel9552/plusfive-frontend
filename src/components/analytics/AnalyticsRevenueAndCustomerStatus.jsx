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

// ברירת מחדל לפאי – רק אם אין pieData מבחוץ
const DEFAULT_PIE = [
  { name: 'New',       value: 120, percentage: '20%', color: '#ff257c' },
  { name: 'Active',    value: 680, percentage: '22%', color: '#ff4e94' },
  { name: 'At Risk',   value: 75,  percentage: '10%', color: '#ff7db1' },
  { name: 'Lost',      value: 58,  percentage: '8%',  color: '#ffb7d4' },
  { name: 'Recovered', value: 240, percentage: '15%', color: '#ffd5e6' },
];

// מיפוי צבעים לפי סטטוס – פה אתה שולט בצבעים של כל פלח
const STATUS_COLORS = {
  New: '#ff257c',
  Active: '#ff4e94',
  'At Risk': '#ff7db1',
  Lost: '#ffb7d4',
  Recovered: '#ffd5e6',
};

function AnalyticsRevenueAndCustomerStatus({
  isReady = false,
  barDataMap,
  filters,
  pieData,
}) {
  // אם העמוד עוד לא מוכן – לא מרנדר כלום (לא מפעיל את הגרפים)
  if (!isReady) return null;

  const _filters = filters ?? DEFAULT_FILTERS;
  const _barDataMap = barDataMap ?? DEFAULT_DATA_MAP;

  // אם הגיע pieData מה־API משתמשים בו, אם לא – DEFAULT_PIE
  const rawPieData = pieData ?? DEFAULT_PIE;

  // כאן אנחנו כופים את הצבעים לפי הסטטוס, לא משנה מה הגיע מה־API
  const _pieData = rawPieData.map((item) => ({
    ...item,
    color: STATUS_COLORS[item.name] || item.color,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-ttcommons mt-6">
      <StatSingleBarChart
        title="Revenue Impact"
        dataMap={_barDataMap}
        filters={_filters}
      />

      <StatPieChart
        title="Customer Status Breakdown"
        data={_pieData}
      />
    </div>
  );
}

export default AnalyticsRevenueAndCustomerStatus;

