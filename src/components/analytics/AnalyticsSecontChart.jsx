import React, { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CommonDropDown } from '../index';
import { useTheme } from '../../context/ThemeContext';

const monthlyQrCodeData = [
    { label: 'July', thisYear: 55, lastYear: 30 }, { label: 'Aug', thisYear: 40, lastYear: 25 }, { label: 'Sep', thisYear: 82, lastYear: 52 },
    { label: 'Oct', thisYear: 58, lastYear: 50 }, { label: 'Nov', thisYear: 68, lastYear: 42 }, { label: 'Dec', thisYear: 92, lastYear: 55 },
];
const quarterlyQrCodeData = [
    { label: 'Q1', thisYear: 120, lastYear: 90 }, { label: 'Q2', thisYear: 150, lastYear: 110 }, { label: 'Q3', thisYear: 180, lastYear: 140 }, { label: 'Q4', thisYear: 210, lastYear: 170 },
];
const yearlyQrCodeData = [
    { label: '2023', thisYear: 600, lastYear: 450 }, { label: '2024', thisYear: 750, lastYear: 600 }, { label: '2025', thisYear: 900, lastYear: 720 },
];
const weeklyQrCodeData = [
    { label: 'Mon', thisYear: 15, lastYear: 10 }, { label: 'Tue', thisYear: 20, lastYear: 12 }, { label: 'Wed', thisYear: 18, lastYear: 15 },
    { label: 'Thu', thisYear: 25, lastYear: 20 }, { label: 'Fri', thisYear: 30, lastYear: 22 }, { label: 'Sat', thisYear: 28, lastYear: 25 }, { label: 'Sun', thisYear: 22, lastYear: 18 },
];
const qrCodeDataMap = { Monthly: monthlyQrCodeData, Quarterly: quarterlyQrCodeData, Yearly: yearlyQrCodeData, 'This Week': weeklyQrCodeData,};
const FILTER_OPTIONS = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Quarterly', value: 'Quarterly' },
    { label: 'Yearly', value: 'Yearly' },
    { label: 'This Week', value: 'This Week' }
];

const ratingData = [
    { month: 'Jan', rating: 4.0 }, { month: 'Feb', rating: 4.4 }, { month: 'Mar', rating: 4.05 }, { month: 'Apr', rating: 4.7 },
    { month: 'May', rating: 4.2 }, { month: 'June', rating: 4.8 }, { month: 'July', rating: 4.4 }, { month: 'Aug', rating: 4.9 },
    { month: 'Sep', rating: 4.6 }, { month: 'Oct', rating: 4.8 }, { month: 'Nov', rating: 4.5 }, { month: 'Dec', rating: 5.0 },
];

const CustomYAxisTick = ({ x, y, payload }) => ( <text x={x} y={y} dy={4} fill="#888" fontSize={12} textAnchor="end">{payload.value === 0 ? '0%' : `${payload.value}k`}</text>);
const CustomRatingYTick = ({ x, y, payload }) => (<text x={x} y={y} dy={4} fill="#888" fontSize={12} textAnchor="end">{payload.value.toFixed(1)}</text>);

function AnalyticsSecontChart() {
    const [filter, setFilter] = useState('Monthly');
    const [hoveredBar, setHoveredBar] = useState(null);
    const { isDarkMode } = useTheme();
    const qrData = useMemo(() => qrCodeDataMap[filter], [filter]);

    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length && hoveredBar) {
            const data = payload.find(p => p.dataKey === hoveredBar);
            if (data) {
                let displayValue;
                let year;
                if (hoveredBar === 'thisYear') {
                    displayValue = data.value * 1000 - 19674.5;
                    year = filter === 'Yearly' ? '' : '2025';
                } else {
                    displayValue = data.value * 1000 - 15000;
                    year = filter === 'Yearly' ? '' : '2024';
                }
                return (
                    <div className="bg-[#2C2C2C] px-3 py-2 rounded-lg shadow-lg text-white">
                        <p className="font-bold text-lg">${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-xs text-gray-400">{label} {year}</p>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-ttcommons mt-7">
            <div className="bg-white dark:bg-customBrown rounded-2xl p-6 border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">QR Code</h2>
                    <CommonDropDown options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qrData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }} barGap={10} onMouseLeave={() => setHoveredBar(null)}>
                    <CartesianGrid
                        strokeDasharray="6 6"
                        vertical={false}
                        stroke={isDarkMode ? "#D1D5DB" : "#000"}
                        strokeOpacity={0.15}
                    />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={<CustomYAxisTick />} domain={[0, 'dataMax']} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} isAnimationActive={false} />
                    <Bar dataKey="lastYear" fill="#4A4A4A" radius={[4, 4, 0, 0]} barSize={12} onMouseOver={() => setHoveredBar('lastYear')} />
                    <Bar dataKey="thisYear" fill="#FF2380" radius={[4, 4, 0, 0]} barSize={12} onMouseOver={() => setHoveredBar('thisYear')} />
                </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white dark:bg-customBrown rounded-2xl p-6 border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack hover:bg-customBody shadow-md hover:shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Average Rating Over Time</h2>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ratingData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <defs>
                    
                            <CartesianGrid
                                strokeDasharray="6 6"
                                vertical={true}
                                stroke={isDarkMode ? "#D1D5DB" : "#000"}
                                strokeOpacity={0.15}
                            />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                            <YAxis tickLine={false} axisLine={false} domain={[1, 5]} tick={<CustomRatingYTick />} />
                            <Tooltip wrapperClassName="!hidden" />
                            <Area type="monotone" dataKey="rating" stroke="#FF2380" strokeWidth={3} fill="none" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsSecontChart;
