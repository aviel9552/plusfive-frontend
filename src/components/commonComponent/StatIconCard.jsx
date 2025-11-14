import React from 'react'

const StatIconCard = ({ icon, image, value, label }) => {
  // 🔍 לוג שיעזור לנו להבין מה מגיע לכרטיס
  console.log('StatIconCard debug →', {
    label,
    hasImageProp: !!image,
    image,
    hasIconProp: !!icon,
    iconType: icon?.type?.name || icon?.type?.displayName || typeof icon
  });

  return (
    <div className="bg-customBody dark:bg-customBrown rounded-[16px] px-6 py-[24px] border border-gray-200 dark:border-commonBorder transition-colors duration-200">
      <div className="flex flex-col items-center text-center gap-[16px]">
        <div className="p-3 bg-gray-100 dark:bg-white rounded-full transition-colors duration-200">
          {image ? (
            <img src={image} alt={label} className="w-6 h-6" />
          ) : (
            icon
          )}
        </div>
        <div className="flex flex-col gap-[4px]">
          <p className="text-30 font-bold font-ttcommons text-gray-900 dark:text-white transition-colors duration-200">
            {value}
          </p>
          <span className="text-gray-600 dark:text-white transition-colors duration-200 text-14">
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatIconCard;
