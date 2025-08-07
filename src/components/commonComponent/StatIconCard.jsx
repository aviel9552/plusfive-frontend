import React from 'react'

const StatIconCard = ({ icon, value, label }) => {
    return (
        <div className="bg-customBody dark:bg-customBrown rounded-xl p-6 border border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-gray-100 dark:bg-white rounded-full transition-colors duration-200">
                    {icon}
                </div>
                <span className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{value}</span>
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{label}</span>
            </div>
        </div>
    )
}

export default StatIconCard; 