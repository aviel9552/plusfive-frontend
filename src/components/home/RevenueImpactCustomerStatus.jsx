import React from 'react';
import { StatSingleBarChart, StatPieChart } from '../index';

const monthlyData = [
  { month: 'Jan', value: 32 },
  { month: 'Feb', value: 24 },
  { month: 'Mar', value: 42 },
  { month: 'Apr', value: 18 },
  { month: 'May', value: 28 },
  { month: 'Jun', value: 24 },
  { month: 'Jul', value: 34 },
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

const FILTERS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Month', value: 'thisMonth' },
];

const dataMap = {
  monthly: monthlyData,
  weekly: weeklyData,
  lastMonth: lastMonthData,
  thisMonth: thisMonthData,
};

const pieChartData = [
  { name: 'Active', value: 680, percentage: '22%', color: '#6366F1' },
  { name: 'At Risk', value: 75, percentage: '10%', color: '#F97316' },
  { name: 'Lost', value: 58, percentage: '8%', color: '#EF4444' },
  { name: 'Recovered', value: 240, percentage: '15%', color: '#EC4899' },
];

function RevenueImpactCustomerStatus() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-ttcommons">
      <StatSingleBarChart 
        title="Revenue Impact" 
        dataMap={dataMap}
        filters={FILTERS}
      />
      <StatPieChart 
        title="Customer Status Breakdown"
        data={pieChartData}
      />
    </div>
  );
}

export default RevenueImpactCustomerStatus;
