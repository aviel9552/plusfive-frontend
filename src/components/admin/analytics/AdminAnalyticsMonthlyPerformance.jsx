import React, { useState, useEffect } from 'react';
import { StatChartCard } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslations } from '../../../utils/translations';
import { useAdminData } from '../../../hooks/useAdminData';
import { getRevenueCounts } from '../../../redux/services/adminServices';
import CommonLoader from '../../../components/commonComponent/CommonLoader';

const timeOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

function AdminAnalyticsMonthlyPerformance() {
  const [timeFrame, setTimeFrame] = useState('monthly');
  const { language } = useLanguage();
  const t = getAdminTranslations(language);
  const { monthlyPerformance, fetchMonthlyPerformance } = useAdminData();
  const [revenueCountsData, setRevenueCountsData] = useState({});
  console.log('revenueCountsData :', revenueCountsData);
  const [revenueCountsLoading, setRevenueCountsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setRevenueCountsLoading(true);
        // Fetch both APIs together
        const currentDate = new Date();
        const [revenueCountsResponse] = await Promise.all([
          getRevenueCounts(),
          fetchMonthlyPerformance(currentDate.getMonth() + 1, currentDate.getFullYear())
        ]);
        
        setRevenueCountsData(revenueCountsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setRevenueCountsLoading(false);
      }
    };
    
    fetchData();
  }, []); // Empty dependency array - run only once on mount

  const formatValue = (value, type) => {
    if (type === 'revenue') {
      // Show actual value with comma formatting and allow decimal places
      return `₪${value.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      })}`;
    }
    if (type === 'ltv') {
      return `${value}`;
    }
    return value;
  };

  const getTrendText = (trend) => {
    return trend === 'up' ? t.increase : t.decrease;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'green' : 'red';
  };

  if (monthlyPerformance.loading || revenueCountsLoading) {
    return (
      <div className="w-full h-[100px]">
        <div className="flex justify-center items-center">
          <CommonLoader />
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
            onClick={() => {
              const currentDate = new Date();
              fetchMonthlyPerformance(currentDate.getMonth() + 1, currentDate.getFullYear());
            }}
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
          value={formatValue(Math.round(revenueCountsData.averageLTV || 0, 'ltv')}
         change={data?.customerLTV?.change || 0}
          trend={getTrendText(data?.customerLTV?.trend)}
          color={getTrendColor(data?.customerLTV?.trend)}
        />
      </div>
    </div>
  );
}

export default AdminAnalyticsMonthlyPerformance;
