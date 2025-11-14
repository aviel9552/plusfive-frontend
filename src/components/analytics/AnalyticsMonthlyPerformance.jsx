import React from 'react';
import { StatChartCard } from '../index';

function AnalyticsMonthlyPerformance({ data, isReady }) {
  // לא מציגים כלום עד שהעמוד מוכן ויש דאטה מה־Parent
  if (!isReady || !data) return null;

  const {
    recoveredCustomers,
    recoveredRevenue,
    lostRevenue,
    ltv, // { value: '6.4/m', change: 3, trend: 'Increase' }
  } = data;

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
          value={recoveredCustomers?.value}
          change={recoveredCustomers?.change}
          trend={recoveredCustomers?.trend}
          color={recoveredCustomers?.color ?? (recoveredCustomers?.change >= 0 ? 'green' : 'red')}
        />

        <StatChartCard
          title="Recovered Revenue"
          value={recoveredRevenue?.value}
          change={recoveredRevenue?.change}
          trend={recoveredRevenue?.trend}
          color={recoveredRevenue?.color ?? (recoveredRevenue?.change >= 0 ? 'green' : 'red')}
        />

        <StatChartCard
          title="Lost Revenue"
          value={lostRevenue?.value}
          change={lostRevenue?.change}
          trend={lostRevenue?.trend}
          color={lostRevenue?.color ?? (lostRevenue?.change >= 0 ? 'green' : 'red')}
        />

        <StatChartCard
          title="Customers Liftime Visits"
          value={ltv?.value}
          change={ltv?.change}
          trend={ltv?.trend}
          color={ltv?.color ?? (ltv?.change >= 0 ? 'green' : 'red')}
        />
      </div>
    </div>
  );
}

export default AnalyticsMonthlyPerformance;
