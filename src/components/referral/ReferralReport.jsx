import React from 'react'
import { BiQr } from 'react-icons/bi'
import { FiEye, FiMousePointer } from 'react-icons/fi'
import { IoStatsChart } from 'react-icons/io5'
import { StatIconCard } from '../index'


function ReferralReport() {

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl text-gray-900 dark:text-white transition-colors duration-200">
                    Reports
                </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatIconCard
                    icon={<BiQr className="text-2xl text-customRed transition-colors duration-200" />}
                    value="25"
                    label="Today's Scans"
                />
                <StatIconCard
                    icon={<FiEye className="text-2xl text-customRed transition-colors duration-200" />}
                    value="128"
                    label="Week Views"
                />
                <StatIconCard
                    icon={<FiMousePointer className="text-2xl text-customRed transition-colors duration-200" />}
                    value="980"
                    label="Month Clicks"
                />
                <StatIconCard
                    icon={<IoStatsChart className="text-2xl text-customRed transition-colors duration-200" />}
                    value="72"
                    label="Referral Conversions"
                />
            </div>
        </div>
    )
}

export default ReferralReport
