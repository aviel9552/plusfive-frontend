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

  // state בשביל הטולטיפ
  const [isHovered, setIsHovered] = useState(false);

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
      if (typeof customIcon === 'object' && customIcon.dark && customIcon.light) {
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

  return (
    <li className="relative list-none">
      <Link
        to={to}
        className={getLinkClasses()}
        title={label} // טולטיפ דפדפן בסיסי
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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

        {/* טקסט – מוצג רק כשהסיידבר פתוח */}
        <span
          className={`transition-opacity duration-300 text-16 ${
            isActive() ? 'text-white' : 'text-gray-700 dark:text-white'
          } ${isCollapsed ? 'hidden' : isRTL ? 'mr-2' : 'ml-2'}`}
        >
          {label}
        </span>

        {/* טולטיפ מותאם – רק כשהסיידבר סגור וריחוף פעיל */}
        {isCollapsed && isHovered && (
          <div
            className={`
              absolute top-1/2 -translate-y-1/2
              ${isRTL ? 'right-16' : 'left-16'}
              bg-[#111111] text-white text-[14px] font-medium
              px-[12px] py-[8px] rounded-[9px]
              whitespace-nowrap
              shadow-lg z-[9999]
            `}
          >
            {label}
          </div>
        )}
      </Link>
    </li>
  );
};

export default SidebarNavItem;
