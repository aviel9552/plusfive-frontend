import React from 'react'
import { BiQr } from 'react-icons/bi'
import { FiEye, FiMousePointer } from 'react-icons/fi'
import { IoStatsChart } from 'react-icons/io5'
import { StatIconCard } from '../index'
import { useLanguage } from '../../context/LanguageContext';
import { getAdminReferralTranslations } from '../../utils/translations';
import Todays_Scans_Icon from '../../assets/Todays_Scans_Icon.svg'
import Month_Clicks_Icon from '../../assets/Month_Clicks_Icon.svg'
import Referral_Conversions_Icon from '../../assets/Referral_Conversions_Icon.svg'
import Week_Views_Icon from '../../assets/Week_Views_Icon.svg'

function ReferralReport() {
    const { language } = useLanguage();
    const t = getAdminReferralTranslations(language);

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl text-gray-900 dark:text-white transition-colors duration-200">
                    {t.reports}
                </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatIconCard
                    image={Todays_Scans_Icon}
                    value="25"
                    label={t.todaysScans}
                />
                <StatIconCard
                    image={Week_Views_Icon}
                    value="128"
                    label={t.weekViews}
                />
                <StatIconCard
                    image={Month_Clicks_Icon}
                    value="980"
                    label={t.monthClicks}
                />
                <StatIconCard
                    image={Referral_Conversions_Icon}
                    value="72"
                    label={t.referralConversions}
                />
            </div>
        </div>
    )
}

export default ReferralReport
