import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminAnalyticsTranslations } from '../../../utils/translations';

const ltvData = [
    { month: 'Jan', ltv: 5.8, tooltipLTV: '5.8' },
    { month: 'Feb', ltv: 6.0, tooltipLTV: '6.0' },
    { month: 'Mar', ltv: 6.6, tooltipLTV: '6.6' },
    { month: 'Apr', ltv: 5.9, tooltipLTV: '5.9' },
    { month: 'May', ltv: 6.5, tooltipLTV: '6.5' },
    { month: 'June', ltv: 6.0, tooltipLTV: '6.0' },
    { month: 'July', ltv: 6.7, tooltipLTV: '6.4' },
    { month: 'Aug', ltv: 6.8, tooltipLTV: '6.8' },
    { month: 'Sep', ltv: 7.0, tooltipLTV: '7.0' },
    { month: 'Oct', ltv: 6.5, tooltipLTV: '6.5' },
    { month: 'Nov', ltv: 6.7, tooltipLTV: '6.7' },
    { month: 'Dec', ltv: 7.5, tooltipLTV: '7.5' },
];

function AdminLTVGrothChart() {
    const { isDarkMode } = useTheme();
    const { language } = useLanguage();
    const t = getAdminAnalyticsTranslations(language);
    const isRTL = language === 'he';

    const chartData = isRTL ? [...ltvData].reverse() : ltvData;

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
                    fill="#FE7503"
                />
            </g>
        );
    };

    return (
        <div className='mt-10 flex flex-col gap-[16px]'>
            {/* <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center`}>
                <h2 className="text-24 font-ttcommons text-gray-900 dark:text-white">{t.ltvGrowthOverTime}</h2>
            </div> */}
            <div className="bg-white dark:bg-customBrown rounded-[16px] p-[24px] border border-gray-200 dark:border-customBorderColor font-ttcommons dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
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
                                domain={[5.5, 7.5]}
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
                                stroke="#675DFF"
                                strokeWidth={2.5}
                                dot={{ r: 6, stroke: '#FE7503', strokeWidth: 2, fill: isDarkMode ? '#000000' : '#ffffff' }}
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
