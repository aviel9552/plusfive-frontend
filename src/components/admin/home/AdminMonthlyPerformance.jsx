import React, { useState } from 'react';
import { StatChartCard } from '../../index';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslations } from '../../../utils/translations';

const timeOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

function AdminMonthlyPerformance() {
  const [timeFrame, setTimeFrame] = useState('monthly');
  const { language } = useLanguage();
  const t = getAdminTranslations(language);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
          {t.monthlyPerformance}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatChartCard
          title={t.recoveredCustomers}
          value="95"
          change={12}
          trend={t.increase}
          color="green"
        />
        <StatChartCard
          title={t.recoveredRevenue}
          value="$18k"
          change={-5}
          trend={t.decrease}
          color="red"
        />
        <StatChartCard
          title={t.lostRevenue}
          value="$122"
          change={3}
          trend={t.increase}
          color="green"
        />
        <StatChartCard
          title={t.customersLTV}
          value="6.4/m"
          change={3}
          trend={t.increase}
          color="green"
        />
      </div>
    </div>
  );
}

export default AdminMonthlyPerformance;
