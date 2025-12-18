import React from 'react';
import { Area, AreaChart, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

const chartData = [
  { name: 'Jan', value: 10 },
  { name: 'Feb', value: 15 },
  { name: 'Mar', value: 12 },
  { name: 'Apr', value: 18 },
  { name: 'May', value: 14 },
  { name: 'Jun', value: 16 },
  { name: 'Jul', value: 19 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-customBorderColor">
        <p className="text-gray-900 dark:text-white font-medium">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const StatChartCard = ({ title, value, change, trend, color, chartColor = "#ff257c" }) => {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const gradientId = React.useId();

  return (
    <div className="bg-white dark:bg-customBrown rounded-xl p-[20px] border border-gray-200 dark:border-commonBorder relative dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
     <span
  className={`text-14 text-black dark:text-white ${isRTL ? 'font-bold' : 'font-medium'}`}
>
  {title}
</span>
      <div className="text-xs opacity-50">
  lang: {language} | isRTL: {String(isRTL)}
</div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          {/* כאן שינינו את צבע המספר + ₪ */}
          <span className="text-44 font-semibold text-[#374151] dark:text-white font-ttcommons">
            {value}
          </span>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
            <span className={`text-12 ${color === 'green' ? 'text-customGreen' : 'text-customRed'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-12 text-customBlack dark:text-white">{trend}</span>
          </div>
        </div>
        <div className="w-24 h-12">
          <ResponsiveContainer width="100%" height={88}>
            <AreaChart data={chartData}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatChartCard;

