import React, { useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, YAxis, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { CommonDropDown } from '../index';
import { useTheme } from '../../context/ThemeContext';

const CustomYAxisTick = ({ x, y, payload }) => {
  if (payload.value === 0) return <text x={x} y={y} dy={3} fill="#6B7280" fontSize={12} textAnchor="end">0%</text>;
  return (
    <text x={x} y={y} dy={3} fill="#6B7280" fontSize={12} textAnchor="end">
      {payload.value}k
    </text>
  );
};

const CustomXAxisTick = ({ x, y, payload }) => {
  return (
    <text x={x} y={y} dy={16} fill="#6B7280" fontSize={12} textAnchor="middle">
      {payload.value}
    </text>
  );
};

const StatSingleBarChart = ({ title, dataMap, filters }) => {
  const [selectedFilter, setSelectedFilter] = useState(filters?.[0]?.value || '');
  const [activeIndex, setActiveIndex] = useState(null);
  const { isDarkMode } = useTheme();

  const chartData = dataMap?.[selectedFilter] || [];

  const getValueIndicator = (entry) => (
    <div className="bg-gray-100 dark:bg-customGray px-4 py-2 rounded-lg shadow-lg transition-colors duration-200">
      <div className="text-gray-900 dark:text-white text-xl font-medium">
        ${entry.value * 500 + 10000}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm">
        {entry.month || 'Month'} 2025
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-customBrown rounded-xl p-6 border border-gray-200 dark:border-gray-800 relative shadow-md dark:shadow-none transition-colors duration-200 dark:hover:bg-customBlack hover:bg-customBody hover:shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-24 text-gray-900 dark:text-white">{title}</h2>
        {filters && dataMap && (
          <CommonDropDown
            options={filters}
            value={selectedFilter}
            onChange={setSelectedFilter}
            className="w-[10rem] h-auto p-1"
          />
        )}
      </div>
      <div className="h-[300px] md:w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDarkMode ? "#D1D5DB" : "#000"}
              opacity={0.4}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={<CustomXAxisTick />}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={<CustomYAxisTick />}
              tickCount={5}
              domain={[0, 40]}
            />
            <Bar 
              dataKey="value" 
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              onMouseOver={(_, idx) => setActiveIndex(idx)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(99,102,241,0.1)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return getValueIndicator(payload[0].payload);
                }
                return null;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatSingleBarChart; 