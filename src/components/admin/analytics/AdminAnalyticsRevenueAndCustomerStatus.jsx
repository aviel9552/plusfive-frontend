import React, { useEffect, useState, useMemo } from 'react';
import { StatSingleBarChart, StatPieChart } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslations, getMonthsTranslations, getStatusTranslations } from '../../../utils/translations';
import { useAdminData } from '../../../hooks/useAdminData';
import { getRevenueImpacts } from '../../../redux/services/adminServices';
import CommonLoader from '../../../components/commonComponent/CommonLoader';

// Function to translate month based on language
const translateMonth = (month, language) => {
  const monthTranslations = getMonthsTranslations(language);
  return monthTranslations?.[month] || month;
};

// Function to translate status based on language
const translateStatus = (status, language) => {
  const statusTranslations = getStatusTranslations(language);
  return statusTranslations?.[status] || status;
};

function AdminAnalyticsRevenueAndCustomerStatus() {
  const { language } = useLanguage();
  const t = getAdminTranslations(language);
  const {
    revenueImpact,
    customerStatus,
    fetchRevenueImpact,
    fetchCustomerStatus,
  } = useAdminData();

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
          fetchCustomerStatus(),
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
  }, []); // run only once on mount

  // Transform revenue impact data for the bar chart with month translations
  const transformRevenueData = (data, isMonthly = false) => {
    if (!data) return [];
    return data.map((item) => ({
      month: isMonthly ? translateMonth(item.label, language) : item.label,
      value: item.revenue,
      year: item.year, // Include year for tooltip display
    }));
  };

  // Colors for each status in the pie chart
  const STATUS_COLORS = {
    New: '#ff257c',
    Active: '#ff4e94',
    'At Risk': '#ff7db1',
    Lost: '#ffb7d4',
    Recovered: '#ffd5e6',
  };

  // Transform customer status data for the pie chart with status translations
  const transformCustomerData = (data) => {
    if (!data) return [];
    return (
      data.breakdown?.map((item) => ({
        name: translateStatus(item.status, language),
        value: item.count,
        percentage: `${item.percentage}%`,
        // קודם ננסה צבע לפי סטטוס, ואם אין – נ fallback לצבע שמגיע מה־API
        color: STATUS_COLORS[item.status] || item.color,
      })) || []
    );
  };

  const FILTERS = [
    { label: t.monthly, value: 'monthly' },
    { label: t.weekly, value: 'weekly' },
    { label: t.lastMonth, value: 'lastMonth' },
    { label: t.yearly, value: 'yearly' },
  ];

  const dataMap = useMemo(() => ({
    monthly: transformRevenueData(revenueImpactsData.monthly || [], true),
    weekly: transformRevenueData(revenueImpactsData.weekly || [], false),
    lastMonth: transformRevenueData(revenueImpactsData.lastMonth || [], false),
    yearly: transformRevenueData(revenueImpactsData.yearly || [], false),
  }), [revenueImpactsData, language]);

  const pieChartData = useMemo(() => transformCustomerData(customerStatus.data), [customerStatus.data, language]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] font-ttcommons">
      <div className="lg:col-span-7">
        {revenueImpact.loading || revenueImpactsLoading ? (
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
