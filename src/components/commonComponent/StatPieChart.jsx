import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

const getPieChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-100 dark:bg-[#43474E] px-4 py-2 rounded-lg shadow-lg transition-colors duration-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
          <span className="text-gray-900 dark:text-white font-medium text-16">{data.name}</span>
        </div>
        <div className="text-gray-900 dark:text-white text-16 font-medium">
          {data.value.toLocaleString()} Users
        </div>
        <div className="text-gray-600 dark:text-white text-12 mt-1">
          {data.percentage} of Total
        </div>
      </div>
    );
  }
  return null;
};

const StatPieChart = ({ title, data }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const customerData = data || [];
  const { isRTL } = useLanguage();

  // Reverse data for Hebrew to show legend in correct RTL order
  const displayData = isRTL ? [...customerData].reverse() : customerData;

  return (
    <div className="bg-white dark:bg-customBrown rounded-[16px] p-[24px] border border-gray-200 dark:border-[#FFFFFF1A] dark:shadow-none transition-colors duration-200 dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
      <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center mb-6`}>
        <h2 className="text-24 text-gray-900 dark:text-white font-ttcommons">{title}</h2>
      </div>

      <div className="flex justify-center">
        <div className="w-[250px] h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                dataKey="value"
                cx="50%"
                cy="50%"
                // innerRadius={75}
                // outerRadius={105}
                innerRadius={62}
                outerRadius={80}
                startAngle={90}
                endAngle={450}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    stroke={entry.color}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                  />
                ))}
              </Pie>
              <Tooltip
                content={getPieChartTooltip}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className={`grid sm:grid-cols-5 grid-cols-2 gap-4 mt-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        {displayData.map((item, index) => (
          <div key={index} className={`flex flex-col items-center ${isRTL ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-1`}>
              <div className={`w-3 h-3 rounded-full ${isRTL ? 'ml-2' : 'mr-2'}`} style={{ backgroundColor: item.color }}></div>
              <span className={`text-black dark:text-white text-14`}>{item.name}</span>
            </div>
            <span className={`text-gray-600 dark:text-white text-12 ${isRTL ? 'text-right' : 'text-left'}`}>
              {item.value} ({item.percentage})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatPieChart; 