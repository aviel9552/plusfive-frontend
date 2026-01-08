import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const SidebarNavItem = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
  specialPaths = [],
  isRTL = false,
  showHoverText = false,
  customIcon = null,
}) => {
  const location = useLocation();
  const { isDarkMode } = useTheme();

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

  // Link stays full-width (easy click). No pink bg here anymore.
  const getLinkClasses = () => {
    return `flex items-center w-full rounded-lg relative group transition-colors duration-200
      ${isCollapsed ? 'justify-center' : 'px-3 py-2'}
      ${isActive() ? '' : 'text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white'}
    `;
  };

  // ✅ Icon ALWAYS white (light mode + dark mode, active + inactive)
  const getIconClasses = () => {
    return 'text-22 lg:text-20 text-white';
  };

  const renderIcon = () => {
    // ✅ If you pass a custom image icon (svg/png), always force it to white too
    if (customIcon) {
      // object with dark/light variants
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

      // single icon src
      return (
        <img
          src={customIcon}
          alt=""
          className="w-5 h-5 lg:w-[20px] lg:h-[20px] brightness-0 invert"
        />
      );
    }

    // normal react-icons
    return <Icon className={getIconClasses()} />;
  };

  return (
    <li className="relative list-none">
      <Link to={to} className={getLinkClasses()}>
        {/* Icon box (square) */}
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

        {/* Label only when open */}
        <span
          className={`transition-opacity duration-300 text-16 ${
            isActive() ? 'text-white' : 'text-gray-700 dark:text-white'
          } ${isCollapsed ? 'hidden' : (isRTL ? 'mr-2' : 'ml-2')}`}
        >
          {label}
        </span>

        {/* Tooltip – Debug Mode: תמיד גלוי כדי שנראה איפה הוא מופיע */}
{true && (
  <span
    className={`
      pointer-events-none absolute top-1/2 -translate-y-1/2
      ${isRTL ? 'right-full mr-4' : 'left-full ml-4'}
      opacity-100                /* 👈 הפכנו ל-100 כדי שיהיה גלוי תמיד */
      z-[9999]
    `}
  >
    <span
      className="
        relative
        bg-[#111111]
        text-white
        text-[14px] font-medium
        px-[14px] py-[10px]
        rounded-[9px]
        whitespace-nowrap
        leading-none
      "
    >
      {label}

      {/* החץ של הבועה */}
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
    </span>
  </span>
)}


              {/* Sharp triangle arrow (Fresha-style) */}
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
            </span>
          </span>
        )}
      </Link>
    </li>
  );
};

export default SidebarNavItem;




