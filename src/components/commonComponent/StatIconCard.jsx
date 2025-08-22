import React from 'react'

const StatIconCard = ({ icon, image, value, label }) => {
    return (
        <div className="bg-customBody dark:bg-customBrown rounded-xl px-6 py-[24px] border border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="flex flex-col items-center text-center gap-[16px]">
                <div className="p-3 bg-gray-100 dark:bg-white rounded-full transition-colors duration-200">
                    {image ? (
                        <img src={image} alt={label} className="w-6 h-6" />
                    ) : (
                        icon
                    )}
                </div>
                <div className='flex flex-col gap-[4px]'>
                    <span className="text-30 font-semibold text-gray-900 dark:text-white transition-colors duration-200">{value}</span>
                    <span className="text-gray-600 dark:text-white transition-colors duration-200 text-14">{label}</span>
                </div>
            </div>
        </div>
    )
}

export default StatIconCard; 