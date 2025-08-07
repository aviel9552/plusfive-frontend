import React from 'react';
import { StatChartCard } from '../index';

function AnalyticsMonthlyPerformance() {

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
          Monthly Performance
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatChartCard
          title="Recovered Customers"
          value="95"
          change={12}
          trend="Increase"
          color="green"
        />
        <StatChartCard
          title="Recovered Revenue"
          value="$18k"
          change={-5}
          trend="Decrease"
          color="red"
        />
        <StatChartCard
          title="Lost Revenue"
          value="$122"
          change={3}
          trend="Increase"
          color="green"
        />
        <StatChartCard
          title="Customers LTV"
          value="6.4/m"
          change={3}
          trend="Increase"
          color="green"
        />
      </div>
    </div>
  );
}

export default AnalyticsMonthlyPerformance;
