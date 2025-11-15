import React, { useState } from 'react'
import { CommonDropDown, StatIconCard } from '../index'
import { BiQr } from 'react-icons/bi'
import { FiMousePointer } from 'react-icons/fi'
import { IoStatsChart } from 'react-icons/io5'

const timeOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
];

function ReportsandAnalyticsTitle() {
    const [timeFrame, setTimeFrame] = useState('monthly')

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="md:text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                    Reports & Analytics
                </h2>
                <CommonDropDown
                    options={timeOptions}
                    value={timeFrame}
                    onChange={setTimeFrame}
                    className="w-auto h-auto p-1"
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatIconCard
                    icon={<BiQr className="text-2xl text-[#ff257c] transition-colors duration-200" />}
                    value="25"
                    label="Scans"
                />
                <StatIconCard
                    icon={<FiMousePointer className="text-2xl text-[#ff257c] transition-colors duration-200" />}
                    value="980"
                    label="Clicks"
                />
                <StatIconCard
                    icon={<IoStatsChart className="text-2xl text-[#ff257c] transition-colors duration-200" />}
                    value="75%"
                    label="Conversions"
                />
            </div>
        </div>
    )
}

export default ReportsandAnalyticsTitle
