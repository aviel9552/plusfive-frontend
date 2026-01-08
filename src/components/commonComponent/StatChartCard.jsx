import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const StatChartCard = ({ title, value, change, trend, color, chartColor = "#ff257c" }) => {
  const { language } = useLanguage();
  const isRTL = language === 'he';

  // Get the "from previous month" text
  const getMonthText = () => {
    if (isRTL) {
      return 'מחודש קודם';
    } else {
      return 'from previous month';
    }
  };

  // Get color for the button based on change value
  const getButtonColor = () => {
    if (change === 0) {
      return 'bg-gray-100/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400';
    } else if (change > 0) {
      return 'bg-green-500/30 dark:bg-green-600/30 text-green-600 dark:text-green-400';
    } else {
      return 'bg-red-500/30 dark:bg-red-600/30 text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.02]">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </div>
      <div className="flex items-start justify-between">
        <div className="flex flex-col flex-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </div>
          {/* Percentage button and text in the same row */}
          <div className="flex items-center gap-2">
            {/* Smaller rectangular percentage button */}
            <div className={`flex items-center justify-center px-2 py-1 rounded-lg ${getButtonColor()} font-semibold text-xs shadow-sm`}>
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {getMonthText()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatChartCard;

