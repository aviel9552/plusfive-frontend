import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const getPieChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-100 dark:bg-[#2C2C2C] px-4 py-2 rounded-lg shadow-lg transition-colors duration-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
          <span className="text-gray-900 dark:text-white font-medium">{data.name}</span>
        </div>
        <div className="text-gray-900 dark:text-white text-xl font-medium">
          {data.value.toLocaleString()} Users
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
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

  return (
    <div className="bg-white dark:bg-customBrown rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none transition-colors duration-200 dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
      <h2 className="text-24 text-gray-900 dark:text-white mb-6">{title}</h2>
      
      <div className="flex justify-center">
        <div className="w-[250px] h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={customerData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                startAngle={90}
                endAngle={450}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {customerData.map((entry, index) => (
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
      <div className="grid sm:grid-cols-4 grid-cols-2 gap-4 mt-6">
        {customerData.map((item, index) => (
          <div key={index} className="flex-col items-center">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
            <span className="text-gray-900 dark:text-white mr-2 text-16">{item.name}</span>
            </div>
            <span className="text-gray-600 dark:text-white ml-5 text-14">{item.value} ({item.percentage})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatPieChart; 