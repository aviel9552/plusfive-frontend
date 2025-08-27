import React, { useState } from 'react'
import { CommonDropDown, StatIconCard } from '../../index'
import { BiQr } from 'react-icons/bi'
import { FiMousePointer } from 'react-icons/fi'
import { IoStatsChart } from 'react-icons/io5'
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminQRTranslations } from '../../../utils/translations';
import Todays_Scans_Icon from '../../../assets/Todays_Scans_Icon.svg'
import Month_Clicks_Icon from '../../../assets/Month_Clicks_Icon.svg'
import Referral_Conversions_Icon from '../../../assets/Referral_Conversions_Icon.svg'

const timeOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
];

function AdminReportsandAnalyticsTitle({ scanCount = 0, shareCount = 0 }) {
    const { language } = useLanguage();
    const t = getAdminQRTranslations(language);
    const [timeFrame, setTimeFrame] = useState('monthly')

    return (
        <div className="w-full gap-[24px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="md:text-20 font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                    {t.reportsAndAnalytics}
                </h2>
                <CommonDropDown
                    options={timeOptions}
                    value={timeFrame}
                    onChange={setTimeFrame}
                    className="w-auto h-auto pb-2"
                    fontSize="text-12"
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                <StatIconCard
                    image={Todays_Scans_Icon}
                    value={scanCount.toString()}
                    label={t.scans}
                />
                <StatIconCard
                    image={Month_Clicks_Icon}
                    value={shareCount.toString()}
                    label={t.clicks}
                />
                <StatIconCard
                    image={Referral_Conversions_Icon}
                    value="75%"
                    label={t.conversions}
                />
            </div>
        </div>
    )
}

export default AdminReportsandAnalyticsTitle
