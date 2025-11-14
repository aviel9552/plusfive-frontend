import React, { useEffect, useState } from 'react';
import { StatSingleBarChart, StatPieChart } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslations } from '../../../utils/translations';
import { useAdminData } from '../../../hooks/useAdminData';
import { getRevenueImpacts } from '../../../redux/services/adminServices';
import CommonLoader from '../../../components/commonComponent/CommonLoader';

function AdminAnalyticsRevenueAndCustomerStatus() {
  const { language } = useLanguage();
  const t = getAdminTranslations(language);
  const { revenueImpact, customerStatus, fetchRevenueImpact, fetchCustomerStatus } = useAdminData();
  const [selectedFilter, setSelectedFilter] = useState('monthly');
  const [revenueImpactsData, setRevenueImpactsData] = useState({});
  const [revenueImpactsLoading, setRevenueImpactsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setRevenueImpactsLoading(true);
        
        // Fetch all APIs together
        const [revenueImpactsResponse] = await Promise.all([
          getRevenueImpacts(),
          fetchRevenueImpact(),
          fetchCustomerStatus()
        ]);
        
        if (revenueImpactsResponse.success && revenueImpactsResponse.data) {
          setRevenueImpactsData(revenueImpactsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setRevenueImpactsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Empty dependency array - run only once on mount

  // Transform revenue impact data for the chart
  const transformRevenueData = (data) => {
    if (!data) return [];
    return data.map(item => ({
      month: item.label,
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
    { label: t.yearly, value: 'yearly' },
  ];

  const dataMap = {
    monthly: transformRevenueData(revenueImpactsData.monthly || []),
    weekly: transformRevenueData(revenueImpactsData.weekly || []),
    lastMonth: transformRevenueData(revenueImpactsData.lastMonth || []),
    yearly: transformRevenueData(revenueImpactsData.yearly || []),
  };

  const pieChartData = transformCustomerData(customerStatus.data);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] font-ttcommons">
      <div className="lg:col-span-7">
        {(revenueImpact.loading || revenueImpactsLoading) ? (
          <div className="flex justify-center items-center h-[360px] bg-white dark:bg-customBrown rounded-lg shadow">
              <CommonLoader />
          </div>
        ) : revenueImpact.error ? (
          <div className="flex justify-center items-center h-[360px] bg-white dark:bg-customBrown rounded-lg shadow">
            <div className="text-red-500 text-center py-8">
              Revenue Error: {revenueImpact.error}
            </div>
          </div>
        ) : (
          <StatSingleBarChart
            title={t.revenueImpact}
            dataMap={dataMap}
            filters={FILTERS}
          />
        )}
      </div>
      <div className="lg:col-span-5">
        {customerStatus.loading ? (
          <div className="flex justify-center items-center h-[360px] bg-white dark:bg-customBrown rounded-lg shadow">
              <CommonLoader />
          </div>
        ) : customerStatus.error ? (
          <div className="flex justify-center items-center h-[360px] bg-white dark:bg-customBrown rounded-lg shadow">
            <div className="text-red-500 text-center py-8">
              Customer Status Error: {customerStatus.error}
            </div>
          </div>
        ) : (
          <StatPieChart
            title={t.customerStatusBreakdown}
            data={pieChartData}
          />
        )}
      </div>
    </div>
  );
}

export default AdminAnalyticsRevenueAndCustomerStatus;

