import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer, YAxis, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { FiChevronDown } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { BRAND_COLOR } from '../../utils/calendar/constants';

const CustomYAxisTick = ({ x, y, payload }) => {
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const textColor = isDarkMode ? "#fff" : "#000";
  
  if (payload.value === 0) return <text x={x} y={y} dy={3} fill={textColor} fontSize={12} textAnchor={isRTL ? "start" : "end"}>0</text>;
  
  // Format large numbers to k format
  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;  // 19000000 → 19M
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;     // 999999 → 999k
    }
    return value.toString();
  };
  
  return (
    <text x={x} y={y} dy={3} fill={textColor} fontSize={12} textAnchor={isRTL ? "start" : "end"}>
      {formatValue(payload.value)}
    </text>
  );
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const { isDarkMode } = useTheme();
  const textColor = isDarkMode ? "#fff" : "#000";
  
  return (
    <text x={x} y={y} dy={16} fill={textColor} fontSize={14} textAnchor="middle">
      {payload.value}
    </text>
  );
};

const StatSingleBarChart = ({ title, dataMap, filters }) => {
  const [selectedFilter, setSelectedFilter] = useState(filters?.[0]?.value || '');
  const [activeIndex, setActiveIndex] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const isRTL = language === 'he';

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    setIsDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const chartData = dataMap?.[selectedFilter] || [];
  const displayData = isRTL ? [...chartData].reverse() : chartData;

  const getValueIndicator = (entry) => {
    const formatTooltipValue = (value) => {
      // Show exact value as requested by client
      return new Intl.NumberFormat().format(value);
    };

    return (
      <div className="bg-gray-100 dark:bg-[#43474E] px-4 py-2 rounded-[16px] shadow-lg transition-colors duration-200">
        <div className="text-gray-900 dark:text-white text-16 font-medium">
        ₪{formatTooltipValue(entry.value)}
        </div>
        <div className="text-gray-600 dark:text-white text-12">
          {entry.month || 'Month'} 2025
        </div>
      </div>
    );
  };

  return (
    <div className="h-[360px] bg-white dark:bg-customGray grid grid-cols-1 gap-[24px] rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.01]">
      <div className="flex justify-between items-center ">
        <h2 className="text-24 text-gray-900 dark:text-white font-ttcommons">{title}</h2>
        {filters && dataMap && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <span className="whitespace-nowrap">
                {filters.find(f => f.value === selectedFilter)?.label || filters[0]?.label || 'Select'}
              </span>
              <FiChevronDown className="text-[14px] text-gray-400" />
            </button>

            {isDropdownOpen && (
              <>
                {/* Overlay layer to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right backdrop-blur-sm"
                  style={{ backgroundColor: isDarkMode ? '#181818' : '#ffffff' }}
                >
                  <div className="py-2">
                    {filters.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => handleFilterChange(filter.value)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              selectedFilter === filter.value
                                ? "border-[rgba(255,37,124,1)]"
                                : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {selectedFilter === filter.value && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: BRAND_COLOR }}
                              />
                            )}
                          </span>
                          <span>{filter.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="h-[250px] md:w-full ">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            margin={isRTL ? { top: 5, right: -20, left: 30, bottom: 5 } : { top: 5, right: 30, left: -20, bottom: 5 }}
            // margin={{
            //   top: 5,
            //   right: 30,
            //   left: 20,
            //   bottom: 5,
            // }}
            barSize={35}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid 
              strokeDasharray="8 12" 
              vertical={false} 
              stroke={isDarkMode ? "#D1D5DB" : "#000"}
              opacity={0.4}
            />
            <XAxis 
              dataKey="month" 
              scale="point"
              padding={{ left: 25, right: 10 }}
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
              orientation={isRTL ? "right" : "left"}
            />
            <Bar 
              dataKey="value" 
              fill="#ff257c"
              radius={[8, 8, 0, 0]}
              maxBarSize={35}
              onMouseOver={(_, idx) => setActiveIndex(idx)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const entry = payload[0].payload;
                  // Don't show tooltip if value is 0
                  if (entry.value === 0) {
                    return null;
                  }
                  return getValueIndicator(entry);
                }
                return null;
              }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatSingleBarChart; 
