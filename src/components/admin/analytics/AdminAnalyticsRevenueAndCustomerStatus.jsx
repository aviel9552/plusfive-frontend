import React from 'react';
import { StatSingleBarChart, StatPieChart } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../../utils/translations';

const monthlyData = [
  { month: 'Jan', value: 32 },
  { month: 'Feb', value: 25 },
  { month: 'Mar', value: 42 },
  { month: 'Apr', value: 18 },
  { month: 'May', value: 28 },
  { month: 'Jun', value: 25 },
  { month: 'Jul', value: 32 },
];

const weeklyData = [
  { month: 'W1', value: 10 },
  { month: 'W2', value: 18 },
  { month: 'W3', value: 22 },
  { month: 'W4', value: 15 },
];

const lastMonthData = [
  { month: 'Week 1', value: 8 },
  { month: 'Week 2', value: 12 },
  { month: 'Week 3', value: 16 },
  { month: 'Week 4', value: 10 },
];

const thisMonthData = [
  { month: 'Week 1', value: 14 },
  { month: 'Week 2', value: 18 },
  { month: 'Week 3', value: 20 },
  { month: 'Week 4', value: 16 },
];

function AdminAnalyticsRevenueAndCustomerStatus() {
  const { language } = useLanguage();
  const t = getAdminAnalyticsTranslations(language);

  const FILTERS = [
    { label: t.monthly, value: 'monthly' },
    { label: t.weekly, value: 'weekly' },
    { label: t.lastMonth, value: 'lastMonth' },
    { label: t.thisMonth, value: 'thisMonth' },
  ];

  const dataMap = {
    monthly: monthlyData,
    weekly: weeklyData,
    lastMonth: lastMonthData,
    thisMonth: thisMonthData,
  };

  const pieChartData = [
      { name: t.active, value: 680, percentage: '22%', color: '#675DFF' },
      { name: t.atRisk, value: 75, percentage: '10%', color: '#FE5D39' },
      { name: t.lost, value: 58, percentage: '8%', color: '#912018' },
      { name: t.recovered, value: 240, percentage: '15%', color: '#DF64CC' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-ttcommons mt-6">
        <StatSingleBarChart 
            title={t.revenueImpact} 
            dataMap={dataMap}
            filters={FILTERS}
        />
        <StatPieChart 
            title={t.customerStatusBreakdown}
            data={pieChartData}
        />
    </div>
  )
}

export default AdminAnalyticsRevenueAndCustomerStatus;
