import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import enTranslations from '../../../i18/en.json';
import heTranslations from '../../../i18/he.json';

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
    const translations = language === 'he' ? heTranslations : enTranslations;
    const t = translations.adminAnalytics;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#2C2C2C] px-3 py-2 rounded-lg shadow-lg text-white font-ttcommons">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-gray-300">{payload[0].payload.tooltipLTV} {t.monthCustomersLTD}</p>
                </div>
            );
        }
        return null;
    };

    const CustomYAxisTick = ({ x, y, payload }) => (
        <text x={x} y={y} dy={4} fill="#888" fontSize={12} textAnchor="end">{payload.value.toFixed(1)}</text>
    );

    return (
        <div className='mt-10'>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t.ltvGrowthOverTime}</h2>
            <div className="bg-white dark:bg-customBrown rounded-2xl p-6 border border-gray-200 dark:border-customBorderColor font-ttcommons dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ltvData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid
                                strokeDasharray="6 6"
                                stroke={isDarkMode ? "#D1D5DB" : "#000"}
                                strokeOpacity={0.15}
                            />
                            <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#444' }} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                            <YAxis
                                tickLine={false}
                                axisLine={{ stroke: '#444' }}
                                domain={[5.5, 7.5]}
                                tick={<CustomYAxisTick />}
                                label={{ value: t.ltdMonthly, angle: -90, position: 'insideLeft', fill: '#fff', fontSize: 14, dx: 5, dy: 50 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Line
                                type="monotone"
                                dataKey="ltv"
                                stroke="#8A3FFC"
                                strokeWidth={2}
                                dot={{ r: 4, stroke: '#FF8A00', strokeWidth: 2, fill: '#1F1F1F' }}
                                activeDot={{ r: 6, stroke: '#FF8A00', strokeWidth: 2, fill: '#1F1F1F' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default AdminLTVGrothChart;
