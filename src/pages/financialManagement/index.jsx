import React from 'react';
import PnLTable from '../../components/financial/PnLTable';

export default function FinancialManagement() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ניהול פיננסי
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          ניהול כספים, תשלומים והכנסות - דוח רווח והפסד (P&L)
        </p>
      </div>

      <PnLTable />
    </div>
  );
}

