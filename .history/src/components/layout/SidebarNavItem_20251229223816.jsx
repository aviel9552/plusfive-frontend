import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const SidebarNavItem = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
  specialPaths = [],
  isRTL = false,
  customIcon = null,
}) => {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const [isHovered, setIsHovered] = useState(false);
  const [tooltipY, setTooltipY] = useState(null); // מיקום קבוע של הטולטיפ במסך

  const isActive = () => {
    if (location.pathname === to) return true;

    return specialPaths.some((path) => {
      if (path.includes(':')) {
        const basePath = path.split(':')[0];
        return location.pathname.startsWith(basePath);
      }
      return location.pathname === path;
    });
  };

  const getLinkClasses = () => {
    return `flex items-center w-full rounded-lg relative transition-colors duration-200
      ${isCollapsed ? 'justify-center' : 'px-3 py-2'}
      ${
        isActive()
          ? ''
          : 'text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white'
      }
    `;
  };

  const getIconClasses = () => {
    return 'text-22 lg:text-20 text-white';
  };

  const renderIcon = () => {
    if (customIcon) {
      if (
        typeof customIcon === 'object' &&
        customIcon.dark &&
        customIcon.light
      ) {
        const iconSrc = isDarkMode ? customIcon.dark : customIcon.light;
        return (
          <img
            src={iconSrc}
            alt=""
            className="w-5 h-5 lg:w-[24px] lg:h-[24px] brightness-0 invert"
          />
        );
      }

      return (
        <img
          src={customIcon}
          alt=""
          className="w-5 h-5 lg:w-[20px] lg:h-[20px] brightness-0 invert"
        />
      );
    }

    return <Icon className={getIconClasses()} />;
  };

  // חישוב מיקום הטולטיפ – רק כשנכנסים עם העכבר
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2; // מרכז האייקון
    setTooltipY(centerY);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // לא מאפסים tooltipY – כדי לאפשר fade-out רך
  };

  return (
    <>
      <li className="relative list-none">
        <Link
          to={to}
          className={getLinkClasses()}
          title={label}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* אייקון בתוך קופסה */}
          <span
            className={`
              flex items-center justify-center
              w-11 h-11 rounded-lg
              transition-colors duration-200
              ${
                isActive()
                  ? 'bg-[#ff257c]/85'
                  : 'hover:bg-[#2c2c2c] dark:hover:bg-[#212121]'
              }
            `}
          >
            {renderIcon()}
          </span>

          {/* טקסט – רק כשהסיידבר פתוח */}
          <span
            className={`transition-opacity duration-300 text-16 ${
              isActive() ? 'text-white' : 'text-gray-700 dark:text-white'
            } ${isCollapsed ? 'hidden' : isRTL ? 'mr-2' : 'ml-2'}`}
          >
            {label}
          </span>
        </Link>
      </li>

      {/* טולטיפ מעוצב – fixed, בגובה קבוע, עם אפקט רך */}
      {tooltipY !== null && (
        <div
          className={`
            fixed
            ${isRTL ? 'right-[90px]' : 'left-[90px]'}
            z-[9999]
            pointer-events-none
          `}
          style={{ top: tooltipY - 30 }}  // ← מרים את הטולטיפ קצת מעל מרכז האייקון
        >
          <div
            className={`
              relative
              bg-[#111111]
              text-white text-[14px] font-medium
              px-[13px] py-[9px]
              rounded-[9px]
              shadow-lg
              whitespace-nowrap
              flex items-center justify-center
              transform
              transition-all duration-150 ease-out
              ${
                isHovered
                  ? 'opacity-300 translate-y-0'
                  : 'opacity-0 -translate-y-[0px]'
              }
            `}
          >
            {label}

            {/* משולש צמוד לתיבה, מצביע על האייקון */}
            <span
              className={`
                absolute top-1/2 -translate-y-1/2
                w-0 h-0
                border-y-[6px] border-y-transparent
                ${
                  isRTL
                    ? 'border-l-[6px] border-l-[#111111] -right-[6px]'
                    : 'border-r-[6px] border-r-[#111111] -left-[6px]'
                }
              `}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarNavItem;
