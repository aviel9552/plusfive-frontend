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

  // Sort data: Order from left to right (LTR): Lead, New, Active, At Risk, Lost, Recovered
  // For RTL, we'll reverse this so Lead appears first from right
  const sortedData = [...customerData].sort((a, b) => {
    const nameA = a.name?.toLowerCase().trim();
    const nameB = b.name?.toLowerCase().trim();
    
    // Check if items are "Lead" or "ליד" (Hebrew)
    const isALead = nameA === 'lead' || nameA === 'ליד';
    const isBLead = nameB === 'lead' || nameB === 'ליד';
    
    // Check if items are "New" or "חדש" (Hebrew)
    const isANew = nameA === 'new' || nameA === 'חדש';
    const isBNew = nameB === 'new' || nameB === 'חדש';
    
    // Check if items are "Active" or "פעיל" (Hebrew)
    const isAActive = nameA === 'active' || nameA === 'פעיל';
    const isBActive = nameB === 'active' || nameB === 'פעיל';
    
    // Check if items are "At Risk" or "בסיכון" (Hebrew)
    const isAAtRisk = nameA === 'at risk' || nameA === 'at_risk' || nameA === 'בסיכון';
    const isBAtRisk = nameB === 'at risk' || nameB === 'at_risk' || nameB === 'בסיכון';
    
    // Check if items are "Lost" or "נוטש" (Hebrew)
    const isALost = nameA === 'lost' || nameA === 'נוטש';
    const isBLost = nameB === 'lost' || nameB === 'נוטש';
    
    // Check if items are "Recovered" or "חוזר" (Hebrew)
    const isARecovered = nameA === 'recovered' || nameA === 'חוזר';
    const isBRecovered = nameB === 'recovered' || nameB === 'חוזר';
    
    // Priority order (LTR): Lead=1, New=2, Active=3, At Risk=4, Lost=5, Recovered=6
    const getPriority = (isLead, isNew, isActive, isAtRisk, isLost, isRecovered) => {
      if (isLead) return 1;
      if (isNew) return 2;
      if (isActive) return 3;
      if (isAtRisk) return 4;
      if (isLost) return 5;
      if (isRecovered) return 6;
      return 7; // Others
    };
    
    const priorityA = getPriority(isALead, isANew, isAActive, isAAtRisk, isALost, isARecovered);
    const priorityB = getPriority(isBLead, isBNew, isBActive, isBAtRisk, isBLost, isBRecovered);
    
    return priorityA - priorityB;
  });

  // Order should be the same for both LTR and RTL: Lead, New, Active, At Risk, Lost, Recovered
  // In RTL, flex-row-reverse will handle the visual order
  const displayData = sortedData;

  return (
    <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.01]">
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

      {/* Legend - All statuses in one row, centered with equal spacing */}
      <div className={`flex justify-center items-start gap-6 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {displayData.map((item, index) => (
          <div key={index} className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} mb-1`}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
              <span className={`text-black dark:text-white text-14 whitespace-nowrap`}>{item.name}</span>
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