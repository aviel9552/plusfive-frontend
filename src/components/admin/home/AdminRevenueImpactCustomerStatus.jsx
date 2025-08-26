import React, { useEffect, useState } from 'react';
import { StatSingleBarChart, StatPieChart } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslations } from '../../../utils/translations';
import { useAdminData } from '../../../hooks/useAdminData';

function AdminRevenueImpactCustomerStatus() {
  const { language } = useLanguage();
  const t = getAdminTranslations(language);
  const { revenueImpact, customerStatus, fetchRevenueImpact, fetchCustomerStatus } = useAdminData();
  const [selectedFilter, setSelectedFilter] = useState('monthly');

  useEffect(() => {
    fetchRevenueImpact();
    fetchCustomerStatus();
  }, [fetchRevenueImpact, fetchCustomerStatus]);

  // Transform revenue impact data for the chart
  const transformRevenueData = (data) => {
    if (!data) return [];
    return data.map(item => ({
      month: item.month.substring(0, 3), // Take first 3 letters of month
      value: item.revenue
    }));
  };

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
    monthly: transformRevenueData(revenueImpact.data),
    weekly: transformRevenueData(revenueImpact.data)?.slice(0, 4) || [],
    lastMonth: transformRevenueData(revenueImpact.data)?.slice(0, 4) || [],
    thisMonth: transformRevenueData(revenueImpact.data)?.slice(0, 4) || [],
  };

  const pieChartData = transformCustomerData(customerStatus.data);

  if (revenueImpact.loading || customerStatus.loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-ttcommons">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (revenueImpact.error || customerStatus.error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-ttcommons">
        <div className="text-red-500 text-center py-8">
          {revenueImpact.error && `Revenue Error: ${revenueImpact.error}`}
        </div>
        <div className="text-red-500 text-center py-8">
          {customerStatus.error && `Customer Status Error: ${customerStatus.error}`}
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

export default AdminRevenueImpactCustomerStatus;
