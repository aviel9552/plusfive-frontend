import React, { useState, useEffect } from 'react';
import { StatChartCard } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslations } from '../../../utils/translations';
import { useAdminData } from '../../../hooks/useAdminData';

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

  useEffect(() => {
    const currentDate = new Date();
    fetchMonthlyPerformance(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [fetchMonthlyPerformance]);

  const formatValue = (value, type) => {
    if (type === 'revenue') {
      return value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`;
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
            {t.monthlyPerformance}
          </h2>
        </div>
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
    // Show fallback data instead of error
    const fallbackData = {
      recoveredCustomers: { value: 95, change: 12, trend: 'up' },
      recoveredRevenue: { value: 18000, change: -5, trend: 'down' },
      lostRevenue: { value: 122, change: 3, trend: 'up' },
      customerLTV: { value: 6.4, change: 3, trend: 'up' }
    };
    
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
            {t.monthlyPerformance}
          </h2>
          <div className="text-orange-500 text-sm">
            Showing fallback data (API Error: {monthlyPerformance.error})
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatChartCard
            title={t.recoveredCustomers}
            value={fallbackData.recoveredCustomers.value}
            change={fallbackData.recoveredCustomers.change}
            trend={getTrendText(fallbackData.recoveredCustomers.trend)}
            color={getTrendColor(fallbackData.recoveredCustomers.trend)}
          />
          <StatChartCard
            title={t.recoveredRevenue}
            value={formatValue(fallbackData.recoveredRevenue.value, 'revenue')}
            change={fallbackData.recoveredRevenue.change}
            trend={getTrendText(fallbackData.recoveredRevenue.trend)}
            color={getTrendColor(fallbackData.recoveredRevenue.trend)}
          />
          <StatChartCard
            title={t.lostRevenue}
            value={formatValue(fallbackData.lostRevenue.value, 'revenue')}
            change={fallbackData.lostRevenue.change}
            trend={getTrendText(fallbackData.lostRevenue.trend)}
            color={getTrendColor(fallbackData.lostRevenue.trend)}
          />
          <StatChartCard
            title={t.customersLTV}
            value={formatValue(fallbackData.customerLTV.value, 'ltv')}
            change={fallbackData.customerLTV.change}
            trend={getTrendText(fallbackData.customerLTV.trend)}
            color={getTrendColor(fallbackData.customerLTV.trend)}
          />
        </div>
      </div>
    );
  }

  const data = monthlyPerformance.data;

  return (
    <div className="w-full flex flex-col gap-[16px]">
      <div className="flex items-center justify-between">
        <h2 className="text-20 font-semibold text-gray-900 dark:text-white transition-colors duration-200">
          {t.monthlyPerformance}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        <StatChartCard
          title={t.recoveredCustomers}
          value={data?.recoveredCustomers?.value || 0}
          change={data?.recoveredCustomers?.change || 0}
          trend={getTrendText(data?.recoveredCustomers?.trend)}
          color={getTrendColor(data?.recoveredCustomers?.trend)}
        />
        <StatChartCard
          title={t.recoveredRevenue}
          value={formatValue(data?.recoveredRevenue?.value || 0, 'revenue')}
          change={data?.recoveredRevenue?.change || 0}
          trend={getTrendText(data?.recoveredRevenue?.trend)}
          color={getTrendColor(data?.recoveredRevenue?.trend)}
        />
        <StatChartCard
          title={t.lostRevenue}
          value={formatValue(data?.lostRevenue?.value || 0, 'revenue')}
          change={data?.lostRevenue?.change || 0}
          trend={getTrendText(data?.lostRevenue?.trend)}
          color={getTrendColor(data?.lostRevenue?.trend)}
        />
        <StatChartCard
          title={t.customersLTV}
          value={formatValue(data?.customerLTV?.value || 0, 'ltv')}
          change={data?.customerLTV?.change || 0}
          trend={getTrendText(data?.customerLTV?.trend)}
          color={getTrendColor(data?.customerLTV?.trend)}
        />
      </div>
    </div>
  );
}

export default AdminMonthlyPerformance;
