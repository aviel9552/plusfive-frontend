import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiChevronDown } from 'react-icons/fi';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminAnalyticsTranslations, getMonthsTranslations, getDaysTranslations } from '../../../utils/translations';
import { getAverageRating, getQRCodeAnalytics } from '../../../redux/services/adminServices';
import { BRAND_COLOR } from '../../../utils/calendar/constants';

// Function to translate month based on language
const translateMonth = (month, language) => {
  const monthTranslations = getMonthsTranslations(language);
  return monthTranslations?.[month] || month;
};

// Function to translate day based on language
const translateDay = (day, language) => {
  const dayTranslations = getDaysTranslations(language);
  return dayTranslations?.[day] || day;
};

// Default data structure (will be replaced by API data)
const defaultQrCodeData = [
    { label: 'Jan', scanCount: 0, shareCount: 0 },
    { label: 'Feb', scanCount: 0, shareCount: 0 },
    { label: 'Mar', scanCount: 0, shareCount: 0 },
    { label: 'Apr', scanCount: 0, shareCount: 0 },
    { label: 'May', scanCount: 0, shareCount: 0 },
    { label: 'Jun', scanCount: 0, shareCount: 0 },
    { label: 'Jul', scanCount: 0, shareCount: 0 },
    { label: 'Aug', scanCount: 0, shareCount: 0 },
    { label: 'Sep', scanCount: 0, shareCount: 0 },
    { label: 'Oct', scanCount: 0, shareCount: 0 },
    { label: 'Nov', scanCount: 0, shareCount: 0 },
    { label: 'Dec', scanCount: 0, shareCount: 0 },
];

// Default rating data (will be replaced by API data)
const defaultRatingData = [
    { month: 'Jan', rating: 0 }, { month: 'Feb', rating: 0 }, { month: 'Mar', rating: 0 }, { month: 'Apr', rating: 0 },
    { month: 'May', rating: 0 }, { month: 'Jun', rating: 0 }, { month: 'Jul', rating: 0 }, { month: 'Aug', rating: 0 },
    { month: 'Sep', rating: 0 }, { month: 'Oct', rating: 0 }, { month: 'Nov', rating: 0 }, { month: 'Dec', rating: 0 },
];

const CustomYAxisTick = ({ x, y, payload }) => {
    const { isDarkMode } = useTheme();
    const textColor = isDarkMode ? "#ffffff" : "#000000";
    return (
        <text x={x} y={y} dy={4} fill={textColor} fontSize={12} textAnchor="end">
            {payload.value}
        </text>
    );
};

const CustomRatingYTick = ({ x, y, payload }) => {
    const { isDarkMode } = useTheme();
    const textColor = isDarkMode ? "#ffffff" : "#000000";
    return (
        <text x={x} y={y} dy={4} fill={textColor} fontSize={12} textAnchor="end">
            {payload.value.toFixed(0)}
        </text>
    );
};

function AdminAnalyticsSecontChart({ onLoadingChange }) {
    const [filter, setFilter] = useState('Monthly');
    const [hoveredBar, setHoveredBar] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [qrAnalyticsData, setQrAnalyticsData] = useState({
        monthlyQrCodeData: defaultQrCodeData,
        quarterlyQrCodeData: [],
        yearlyQrCodeData: [],
        weeklyQrCodeData: []
    });
    const [averageRatingData, setAverageRatingData] = useState({
        monthlyData: defaultRatingData,
        overallStats: { totalReviews: 0, averageRating: 0, year: 2025 }
    });
    const [qrAnalyticsLoading, setQrAnalyticsLoading] = useState(true);
    const [averageRatingLoading, setAverageRatingLoading] = useState(true);

    const { isDarkMode } = useTheme();
    const { language } = useLanguage();
    const isRTL = language === 'he';
    const t = getAdminAnalyticsTranslations(language);

    // Fetch all analytics data together
    useEffect(() => {
        const fetchAllAnalyticsData = async () => {
            try {
                setQrAnalyticsLoading(true);
                setAverageRatingLoading(true);

                // Fetch both APIs in parallel
                const [qrAnalyticsResponse, averageRatingResponse] = await Promise.all([
                    getQRCodeAnalytics(),
                    getAverageRating()
                ]);

                if (qrAnalyticsResponse && qrAnalyticsResponse.success && qrAnalyticsResponse.data) {
                    setQrAnalyticsData(qrAnalyticsResponse.data);
                } else {
                    console.error('Invalid QR analytics response structure:', qrAnalyticsResponse);
                    setQrAnalyticsData({
                        monthlyQrCodeData: defaultQrCodeData,
                        quarterlyQrCodeData: [],
                        yearlyQrCodeData: [],
                        weeklyQrCodeData: []
                    });
                }
                setQrAnalyticsLoading(false);

                if (averageRatingResponse && averageRatingResponse.success && averageRatingResponse.data) {
                    setAverageRatingData(averageRatingResponse.data);
                } else {
                    console.error('Invalid average rating response structure:', averageRatingResponse);
                    setAverageRatingData({
                        monthlyData: defaultRatingData,
                        overallStats: { totalReviews: 0, averageRating: 0, year: new Date().getFullYear() }
                    });
                }
                setAverageRatingLoading(false);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                console.error('Error details:', error.response?.data || error.message);
                setQrAnalyticsData({
                    monthlyQrCodeData: defaultQrCodeData,
                    quarterlyQrCodeData: [],
                    yearlyQrCodeData: [],
                    weeklyQrCodeData: []
                });
                setAverageRatingData({
                    monthlyData: defaultRatingData,
                    overallStats: { totalReviews: 0, averageRating: 0, year: new Date().getFullYear() }
                });
                setQrAnalyticsLoading(false);
                setAverageRatingLoading(false);
            }
        };

        fetchAllAnalyticsData();
    }, []); // Empty dependency array - run only once on mount

    // Notify parent component about loading state changes
    useEffect(() => {
        if (onLoadingChange) {
            const isLoading = qrAnalyticsLoading || averageRatingLoading;
            onLoadingChange(isLoading);
        }
    }, [qrAnalyticsLoading, averageRatingLoading, onLoadingChange]);

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

    // Transform data with translations
    const qrCodeDataMap = {
        'Monthly': (qrAnalyticsData.monthlyQrCodeData || []).map(item => ({
            ...item,
            label: translateMonth(item.label, language)
        })),
        'Quarterly': qrAnalyticsData.quarterlyQrCodeData || [],
        'Yearly': qrAnalyticsData.yearlyQrCodeData || [],
        'This Week': (qrAnalyticsData.weeklyQrCodeData || []).map(item => ({
            ...item,
            label: translateDay(item.label, language)
        }))
    };

    const FILTER_OPTIONS = [
        { label: t.monthly, value: 'Monthly' },
        { label: t.quarterly, value: 'Quarterly' },
        { label: t.yearly, value: 'Yearly' },
        { label: t.thisWeek, value: 'This Week' }
    ];

    const qrData = useMemo(() => qrCodeDataMap[filter], [filter, qrAnalyticsData, language]);

    // Transform API data for the rating chart with month translations
    const ratingData = useMemo(() => {
        if (averageRatingData.monthlyData && averageRatingData.monthlyData.length > 0) {
            return averageRatingData.monthlyData.map(item => ({
                month: translateMonth(item.month, language),
                rating: item.averageRating
            }));
        }
        return defaultRatingData.map(item => ({
            ...item,
            month: translateMonth(item.month, language)
        }));
    }, [averageRatingData.monthlyData, language]);

    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length && hoveredBar) {
            const data = payload.find(p => p.dataKey === hoveredBar);
            if (data) {
                const currentYear = new Date().getFullYear();
                let displayValue = data.value;
                let year = filter === 'Yearly' ? '' : currentYear;
                let metricType = hoveredBar === 'scanCount' ? 'Scans' : 'Shares';

                return (
                    <div className="bg-gray-100 dark:bg-[#43474E] px-3 py-2 rounded-lg shadow-lg text-gray-800 dark:text-white">
                        <p className="font-bold text-lg">{metricType}: {displayValue}</p>
                        <p className="text-xs text-gray-400">{label} {year} Year</p>
                    </div>
                );
            }
        }
        return null;
    };

    const CustomRatingTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const currentYear = new Date().getFullYear();
            const rating = payload[0].value;

            // Don't show tooltip if rating is 0
            if (rating === 0) {
                return null;
            }

            return (
                <div className="bg-gray-100 dark:bg-[#43474E] px-3 py-2 rounded-lg shadow-lg text-gray-800 dark:text-white">
                    <p className="font-bold text-lg">Average Rating: {rating.toFixed(1)}</p>
                    <p className="text-xs text-gray-600 dark:text-white">{label} {currentYear}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] font-ttcommons mt-7">

            <div className="lg:col-span-5">
                <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.01]">
                        <div className="flex justify-between items-center mb-[31px] text-center">
                            <h2 className="text-24 font-ttcommons text-gray-900 dark:text-white text-center">{t.qrCode}</h2>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                >
                                    <span className="whitespace-nowrap">
                                        {FILTER_OPTIONS.find(f => f.value === filter)?.label || FILTER_OPTIONS[0]?.label || 'Select'}
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
                                                {FILTER_OPTIONS.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                                        onClick={() => {
                                                            setFilter(option.value);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span
                                                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                                    filter === option.value
                                                                        ? "border-[rgba(255,37,124,1)]"
                                                                        : "border-gray-300 dark:border-gray-500"
                                                                }`}
                                                            >
                                                                {filter === option.value && (
                                                                    <span
                                                                        className="w-2 h-2 rounded-full"
                                                                        style={{ backgroundColor: BRAND_COLOR }}
                                                                    />
                                                                )}
                                                            </span>
                                                            <span>{option.label}</span>
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={isRTL ? [...qrData].reverse() : qrData}
                                    margin={isRTL ? { top: 5, right: -20, left: 20, bottom: 5 } : { top: 5, right: 0, left: -20, bottom: 5 }}
                                    barGap={10}
                                    onMouseLeave={() => setHoveredBar(null)}
                                >
                                    <defs>
                                        <linearGradient id="lastYearGradient" x1="0" y1="1" x2="0" y2="0">
                                            <stop offset="0%" stopColor="#ffb7d4" />
                                            <stop offset="100%" stopColor="#ffb7d4" />
                                        </linearGradient>
                                        <linearGradient id="thisYearGradient" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate(259)">
                                            {/* <stop offset="3.28%" stopColor="#FE5D39" />
                                            <stop offset="49.86%" stopColor="#FF2380" />
                                            <stop offset="100.32%" stopColor="#DF64CC" /> */}
                                            <stop offset="100.32%" stopColor="#ff257c" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="6 6"
                                        vertical={false}
                                        stroke={isDarkMode ? "#D1D5DB" : "#000"}
                                        strokeOpacity={0.15}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fill: isDarkMode ? '#ffffff' : '#000000',
                                            fontSize: 14
                                        }}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={<CustomYAxisTick />}
                                        domain={[0, 'dataMax + 1']}
                                        orientation={isRTL ? "right" : "left"}
                                    />
                                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} isAnimationActive={false} />
                                    <Bar
                                        dataKey="scanCount"
                                        fill="url(#thisYearGradient)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={12}
                                        onMouseOver={() => setHoveredBar('scanCount')}
                                    />
                                    <Bar
                                        dataKey="shareCount"
                                        fill="url(#lastYearGradient)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={12}
                                        onMouseOver={() => setHoveredBar('shareCount')}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
            </div>

            <div className="lg:col-span-7">
                <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.01]">
                        <h2 className="text-24 font-ttcommons text-gray-900 dark:text-white mb-[32px]">{t.averageRatingOverTime}</h2>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={isRTL ? [...ratingData].reverse() : ratingData}
                                    margin={isRTL ? { top: 5, right: -40, left: 15, bottom: 5 } : { top: 5, right: 0, left: -40, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF2380" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#FF2380" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="8 12"
                                        vertical={true}
                                        stroke={isDarkMode ? "#D1D5DB" : "#000"}
                                        strokeOpacity={0.15}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fill: isDarkMode ? '#ffffff' : '#000000',
                                            fontSize: 14
                                        }}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 5]}
                                        tickCount={6}
                                        tick={<CustomRatingYTick />}
                                        orientation={isRTL ? "right" : "left"}
                                    />
                                    <Tooltip content={<CustomRatingTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} isAnimationActive={false} />
                                    <Area type="monotone" dataKey="rating" stroke="#FF2380" strokeWidth={3} fill="url(#ratingGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
            </div>

        </div>
    );
}

export default AdminAnalyticsSecontChart;
