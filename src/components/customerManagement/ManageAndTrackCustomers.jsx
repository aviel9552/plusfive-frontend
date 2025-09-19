import React from 'react'
import { HiTrendingUp } from 'react-icons/hi'
import { LuUsers } from 'react-icons/lu'
import { RiLoopRightLine } from 'react-icons/ri'
import { RxExclamationTriangle } from 'react-icons/rx'
import { StatIconCard, CommonLoader } from '../index'
import { useLanguage } from '../../context/LanguageContext'
import { getUserCustomerTranslations } from '../../utils/translations'
import Total_Customers_Icon from '../../assets/Total_Customers_Icon.svg'
import Active_Customers_Icon from '../../assets/Active_Customers_Icon.svg'
import At_Risk_Customers_Icon from '../../assets/At_Risk_Customers_Icon.svg'
import Total_Revenue_Icon from '../../assets/Total_Revenue_Icon.svg'

function ManageAndTrackCustomers({ statusCounts = {}, loading = false }) {
    const { language } = useLanguage();
    const t = getUserCustomerTranslations(language);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <CommonLoader />
            </div>
        );
    }

    return (
        <div className="w-full gap-[24px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-20 text-gray-900 dark:text-white transition-colors duration-200 ">
                    {t.manageAndTrackCustomers}
                </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-[24px]">
                <StatIconCard
                    image={Total_Customers_Icon}
                    value={statusCounts.new || 0}
                    label={t.new}
                />
                <StatIconCard
                    image={Total_Customers_Icon}
                    value={statusCounts.active || 0}
                    label={t.active}
                />
                <StatIconCard
                    image={Active_Customers_Icon}
                    value={statusCounts.at_risk || 0}
                    label={t.atRisk}
                />
                <StatIconCard
                    image={At_Risk_Customers_Icon}
                    value={statusCounts.lost || 0}
                    label={t.lost}
                />
                <StatIconCard
                    image={Total_Revenue_Icon}
                    value={statusCounts.recovered || 0}
                    label={t.recovered}
                />
            </div>
        </div>
    )
}

export default ManageAndTrackCustomers
