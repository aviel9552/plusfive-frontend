import React from 'react';

const StatIconCard = ({ icon, image, value, label, iconColor = '#ff257c' }) => {
  // דואגים שגם אם האייקון הגיע עם className או style משלו – נדרוס רק את הצבע
  const renderedIcon = image
    ? (
      <img src={image} alt={label} className="w-6 h-6" />
    ) : icon
      ? React.cloneElement(icon, {
          style: {
            ...(icon.props.style || {}),
            color: iconColor,      // 🔥 כאן אנחנו קובעים את הצבע הסופי של האייקון
          },
          className: `${icon.props.className || ''} transition-colors duration-200`,
        })
      : null;

  return (
    <div className="bg-customBody dark:bg-customBrown rounded-[16px] px-6 py-[24px] border border-gray-200 dark:border-commonBorder transition-colors duration-200">
      <div className="flex flex-col items-center text-center gap-[16px]">
        <div className="p-3 bg-gray-100 dark:bg-white rounded-full transition-colors duration-200 flex items-center justify-center">
          {renderedIcon}
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
  );
};

export default StatIconCard;
