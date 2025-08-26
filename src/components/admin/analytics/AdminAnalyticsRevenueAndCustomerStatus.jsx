import React, { useEffect, useState } from 'react';
import { StatSingleBarChart, StatPieChart } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../../utils/translations';
import { useAdminData } from '../../../hooks/useAdminData';

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
  const { customerStatus, fetchCustomerStatus } = useAdminData();

  useEffect(() => {
    fetchCustomerStatus();
  }, [fetchCustomerStatus]);

  // Transform customer status data for the pie chart
  const transformCustomerData = (data) => {
    if (!data) return [];
    return data.breakdown?.map(item => ({
      name: item.status,
      value: item.count,
      percentage: `${item.percentage}%`,
      color: item.color
    })) || [];
  };

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

  const pieChartData = transformCustomerData(customerStatus.data);

  if (customerStatus.loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] font-ttcommons">
        <div className="lg:col-span-7">
          <StatSingleBarChart
            title={t.revenueImpact}
            dataMap={dataMap}
            filters={FILTERS}
          />
        </div>
        <div className="lg:col-span-5 animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (customerStatus.error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] font-ttcommons">
        <div className="lg:col-span-7">
          <StatSingleBarChart
            title={t.revenueImpact}
            dataMap={dataMap}
            filters={FILTERS}
          />
        </div>
        <div className="lg:col-span-5 text-red-500 text-center py-8">
          Customer Status Error: {customerStatus.error}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] font-ttcommons">
      <div className="lg:col-span-7">
        <StatSingleBarChart
          title={t.revenueImpact}
          dataMap={dataMap}
          filters={FILTERS}
        />
      </div>
      <div className="lg:col-span-5">
        <StatPieChart
          title={t.customerStatusBreakdown}
          data={pieChartData}
        />
      </div>
    </div>
  );
}

export default AdminAnalyticsRevenueAndCustomerStatus;
