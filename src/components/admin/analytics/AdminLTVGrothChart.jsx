import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../../utils/translations';
import { getMonthlyLTVCount } from '../../../redux/services/adminServices';
import { CommonLoader } from '../../index';


function AdminLTVGrothChart() {
    const { isDarkMode } = useTheme();
    const { language } = useLanguage();
    const t = getAdminAnalyticsTranslations(language);
    const isRTL = language === 'he';

    const [monthlyLTVCountData, setMonthlyLTVCountData] = useState({});
    const [loading, setLoading] = useState(true);
    const hasApiCalled = useRef(false);

    // Transform API data for chart - only dynamic data
    const transformedData = monthlyLTVCountData?.monthlyLTVData?.map(item => ({
        month: item.month,
        ltv: item.averageLTVCount || 0,
        tooltipLTV: item.averageLTVCount ? item.averageLTVCount.toFixed(1) : '0.0'
    })) || [];

    const chartData = isRTL ? [...transformedData].reverse() : transformedData;
    // Fetch Monthly LTV data - ensure it runs only once
    useEffect(() => {
        const fetchMonthlyLTVCount = async () => {
            // Prevent multiple API calls
            if (hasApiCalled.current) return;
            
            try {
                setLoading(true);
                hasApiCalled.current = true;
                
                const response = await getMonthlyLTVCount();
                if (response.success && response.data) {
                    setMonthlyLTVCountData(response.data);
                }
            } catch (error) {
                console.error('Error fetching Monthly LTV Count:', error);
                // Reset flag on error to allow retry
                hasApiCalled.current = false;
            } finally {
                setLoading(false);
            }
        };
  
        fetchMonthlyLTVCount();
    }, []); // Empty dependency array ensures this runs only once

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-100 dark:bg-[#43474E] px-3 py-2 rounded-lg shadow-lg text-gray-900 dark:text-white font-ttcommons">
                    <p className="font-semibold text-14">{label}</p>
                    <p className="text-16 dark:text-white text-gray-600">{payload[0].payload.tooltipLTV} {t.monthCustomersLTD}</p>
                </div>
            );
        }
        return null;
    };

    const CustomYAxisTick = ({ x, y, payload }) => {
        const textColor = isDarkMode ? "#fff" : "#000";
        return (
            <text x={x} y={y} dy={4} fill={textColor} fontSize={12} textAnchor="end">
                {payload.value.toFixed(1)}
            </text>
        );
    };

    const CustomActiveDot = (props) => {
        const { cx, cy } = props;
        return (
            <g>
                {/* Black middle ring */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    // fill="#000000"
                    fill={isDarkMode ? '#000000' : '#ffffff'}
                />
                {/* Yellow center circle */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="ffb7d4"
                />
            </g>
        );
    };

    if (loading) {
        return (
            <div className='mt-10 flex flex-col gap-[16px]'>
                <div className="bg-white dark:bg-customBrown rounded-[16px] p-[24px] border border-gray-200 dark:border-commonBorder font-ttcommons dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
                    <div className="h-[250px] flex items-center justify-center">
                        <CommonLoader />
                    </div>
                </div>
            </div>
        );
    }

    if (!chartData || chartData.length === 0) {
        return (
            <div className='mt-10 flex flex-col gap-[16px]'>
                <div className="bg-white dark:bg-customBrown rounded-[16px] p-[24px] border border-gray-200 dark:border-commonBorder font-ttcommons dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
                    <div className="h-[250px] flex items-center justify-center">
                        <div className="text-gray-500 dark:text-gray-400">No LTV data available</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='mt-10 flex flex-col gap-[16px]'>
            {/* <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center`}>
                <h2 className="text-24 font-ttcommons text-gray-900 dark:text-white">{t.ltvGrowthOverTime}</h2>
            </div> */}
            <div className="bg-white dark:bg-customBrown rounded-[16px] p-[24px] border border-gray-200 dark:border-commonBorder font-ttcommons dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                            data={chartData} 
                            margin={isRTL ? { top: 5, right: 0, left: 20, bottom: 5 } : { top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="6 6"
                                stroke={isDarkMode ? "#D1D5DB" : "#000"}
                                strokeOpacity={0.15}
                            />
                            <XAxis 
                                dataKey="month" 
                                tickLine={false} 
                                axisLine={{ stroke: '#444' }} 
                                tick={{ 
                                    fill: isDarkMode ? '#fff' : '#000', 
                                    fontSize: 14 
                                }} 
                                dy={10} 
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={{ stroke: '#444' }}
                                domain={[0, 'dataMax + 0.5']}
                                tick={<CustomYAxisTick />}
                                orientation={isRTL ? "right" : "left"}
                                label={{ 
                                    value: t.ltdMonthly, 
                                    angle: isRTL ? 90 : -90, 
                                    position: isRTL ? 'insideRight' : 'insideLeft', 
                                    fill: isDarkMode ? '#fff' : '#000', 
                                    fontSize: 14, 
                                    dx: isRTL ? -5 : 5, 
                                    dy: 50 
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Line
                                type="monotone"
                                dataKey="ltv"
                                stroke="#ff257c"
                                strokeWidth={2.5}
                                dot={{ r: 6, stroke: 'ffb7d4', strokeWidth: 2, fill: isDarkMode ? '#000000' : '#ffffff' }}
                                activeDot={<CustomActiveDot />}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default AdminLTVGrothChart;
