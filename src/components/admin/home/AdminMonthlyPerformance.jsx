import React, { useState, useEffect } from 'react';
import { StatChartCard } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslations } from '../../../utils/translations';
import { useAdminData } from '../../../hooks/useAdminData';
import { getRevenueCounts } from '../../../redux/services/adminServices';

const timeOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

function AdminMonthlyPerformance() {
  const [timeFrame, setTimeFrame] = useState('monthly');
  const { language } = useLanguage();
  const t = getAdminTranslations(language);
  const { monthlyPerformance, fetchMonthlyPerformance } = useAdminData();
  const [revenueCountsData, setRevenueCountsData] = useState({});

  useEffect(() => {
    // Fetch revenue counts API only (monthly performance is handled by parent)
    const fetchRevenueCounts = async () => {
      try {
        const revenueCounts = await getRevenueCounts();
        setRevenueCountsData(revenueCounts.data);
      } catch (error) {
        console.error('Error fetching revenue counts:', error);
      }
    };
    
    fetchRevenueCounts();
  }, []); // Empty dependency array to call only once

  const formatValue = (value, type) => {
    if (type === 'revenue') {
      return value >= 1000 ? `₪${(value / 1000).toFixed(0)}k` : `₪${value}`;
    }
    if (type === 'ltv') {
      return `${value}/m`;
    }
    return value;
  };

  const getTrendText = (trend) => {
    return trend === 'up' ? t.increase : t.decrease;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'green' : 'red';
  };

  if (monthlyPerformance.loading) {
    return (
      <div className="w-full">
        {/* <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
            {t.monthlyPerformance}
          </h2>
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (monthlyPerformance.error) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            Error Loading Monthly Performance Data
          </div>
          <div className="text-red-500 dark:text-red-300 text-sm text-center">
            {monthlyPerformance.error}
          </div>
          <button 
            onClick={() => fetchMonthlyPerformance()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const data = monthlyPerformance.data;

  return (
    <div className="w-full flex flex-col gap-[16px]">
      {/* <div className="flex items-center justify-between">
        <h2 className="text-20 font-semibold text-gray-900 dark:text-white transition-colors duration-200">
          {t.monthlyPerformance}
        </h2>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        <StatChartCard
          title={t.recoveredCustomers}
          value={revenueCountsData.recoveredCustomersCount || 0}
          change={data?.recoveredCustomers?.change || 0}
          trend={getTrendText(data?.recoveredCustomers?.trend)}
          color={getTrendColor(data?.recoveredCustomers?.trend)}
        />
        <StatChartCard
          title={t.recoveredRevenue}
          value={formatValue(revenueCountsData.totalRecoveredRevenue || 0, 'revenue')}
          change={data?.recoveredRevenue?.change || 0}
          trend={getTrendText(data?.recoveredRevenue?.trend)}
          color={getTrendColor(data?.recoveredRevenue?.trend)}
        />
        <StatChartCard
          title={t.lostRevenue}
          value={formatValue(revenueCountsData.totalLostRevenue || 0, 'revenue')}
          change={data?.lostRevenue?.change || 0}
          trend={getTrendText(data?.lostRevenue?.trend)}
          color={getTrendColor(data?.lostRevenue?.trend)}
        />
        <StatChartCard
          title={t.customersLTV}
          value={formatValue(revenueCountsData.averageLTV || 0, 'ltv')}
          change={data?.customerLTV?.change || 0}
          trend={getTrendText(data?.customerLTV?.trend)}
          color={getTrendColor(data?.customerLTV?.trend)}
        />
      </div>
    </div>
  );
}

export default AdminMonthlyPerformance;
