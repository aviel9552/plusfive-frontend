import React from 'react'
import { HiTrendingUp } from 'react-icons/hi'
import { LuUsers } from 'react-icons/lu'
import { RiLoopRightLine } from 'react-icons/ri'
import { RxExclamationTriangle } from 'react-icons/rx'
import { StatIconCard } from '../index'
import { useLanguage } from '../../context/LanguageContext'
import { getUserCustomerTranslations } from '../../utils/translations'

function ManageAndTrackCustomers() {
    const { language } = useLanguage();
    const t = getUserCustomerTranslations(language);

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl text-gray-900 dark:text-white transition-colors duration-200">
                    {t.manageAndTrackCustomers}
                </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatIconCard
                    icon={<LuUsers className="text-2xl text-customRed transition-colors duration-200" />}
                    value="12"
                    label={t.active}
                />
                <StatIconCard
                    icon={<HiTrendingUp className="text-2xl text-customRed transition-colors duration-200" />}
                    value="8"
                    label={t.atRisk}
                />
                <StatIconCard
                    icon={<RxExclamationTriangle className="text-2xl text-customRed transition-colors duration-200" />}
                    value="4"
                    label={t.lost}
                />
                <StatIconCard
                    icon={<RiLoopRightLine className="text-2xl text-customRed transition-colors duration-200 rotate-[120deg]" />}
                    value="235"
                    label={t.recovered}
                />
            </div>
        </div>
    )
}

export default ManageAndTrackCustomers
