import React, { useState, useEffect } from 'react';
import { CommonDropDown } from '../index';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import CommonLoader from './CommonLoader';

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
  const [Recharts, setRecharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const isRTL = language === 'he';

  // 🧩 Lazy-load Recharts - Only load when chart component mounts (saves ~361KB from initial bundle)
  useEffect(() => {
    let isMounted = true;
    
    const loadRecharts = async () => {
      try {
        const rechartsModule = await import('recharts');
        if (isMounted) {
          setRecharts(rechartsModule);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading Recharts:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRecharts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
  };

  const chartData = dataMap?.[selectedFilter] || [];
  const displayData = isRTL ? [...chartData].reverse() : chartData;

  // Extract Recharts components
  const { BarChart, Bar, ResponsiveContainer, YAxis, CartesianGrid, XAxis, Tooltip } = Recharts || {};

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
    <div className="h-[360px] bg-white dark:bg-customBrown grid grid-cols-1 gap-[24px] rounded-xl p-[24px] border border-gray-200 dark:border-commonBorder relative shadow-md dark:shadow-none transition-colors duration-200 dark:hover:bg-customBlack hover:bg-customBody hover:shadow-sm">
      <div className="flex justify-between items-center ">
        <h2 className="text-24 text-gray-900 dark:text-white font-ttcommons">{title}</h2>
        {filters && dataMap && (
          <CommonDropDown
            options={filters} 
            value={selectedFilter}   
            onChange={handleFilterChange}
            fontSize="text-12"
            className="w-[110px] h-auto pb-2"
          />
        )}
      </div>
      <div className="h-[250px] md:w-full ">
        {loading || !Recharts ? (
          <div className="flex items-center justify-center h-full">
            <CommonLoader />
          </div>
        ) : (
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
                fill="#6166F1"
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
        )}
      </div>
    </div>
  );
};

export default StatSingleBarChart; 