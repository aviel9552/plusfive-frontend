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

  const getLinkClasses = () => {
    return `flex items-center w-full rounded-lg relative group transition-colors duration-200
    ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'}
    ${
      isActive()
        ? 'bg-[#ff257c]/85'
        : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#212121] hover:text-gray-900 dark:hover:text-white'
    }`;
  };

  const getIconClasses = () => {
    return `text-22 lg:text-20 ${
      isActive() ? 'text-white' : 'text-gray-900 dark:text-white'
    }`;
  };

  const renderIcon = () => {
    // Custom icons (images)
    if (customIcon) {
      // If customIcon is an object with dark and light variants
      if (typeof customIcon === 'object' && customIcon.dark && customIcon.light) {
        const iconSrc = isDarkMode ? customIcon.dark : customIcon.light;
        return (
          <img
            src={iconSrc}
            alt=""
            className={`w-5 h-5 lg:w-[30px] lg:h-[30px] ${
              isActive() ? 'brightness-0 invert' : ''
            }`}
          />
        );
      }

      // If customIcon is a single image
      return (
        <img
          src={customIcon}
          alt=""
          className={`w-5 h-5 lg:w-[20px] lg:h-[20px] ${
            isActive() ? 'brightness-0 invert' : ''
          }`}
        />
      );
    }

    // Fallback to react-icons
    return <Icon className={getIconClasses()} />;
  };

  return (
    <li className="relative list-none">
      <Link to={to} className={getLinkClasses()}>
        {/* Icon + (label only when open) */}
        <span className="flex items-center gap-[8px]">
          {renderIcon()}
          <span
            className={`transition-opacity duration-300 text-16 ${
              isActive() ? 'text-white' : 'text-gray-700 dark:text-white'
            } ${isCollapsed ? 'hidden' : 'inline'}`}
          >
            {label}
          </span>
        </span>

        {/* Tooltip (only when collapsed) */}
        {isCollapsed && (
          <span
            className={`
              pointer-events-none absolute top-1/2 -translate-y-1/2
              ${isRTL ? 'right-full mr-4' : 'left-full ml-4'}
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200 ease-out delay-100
              z-[9999]
            `}
          >
            <span
              className="
                relative
                bg-[#111111]
                text-white
                text-[14px] font-medium
                px-[14px] py-[8px]
                rounded-[12px]
                whitespace-nowrap
                leading-none
                shadow-[0_10px_30px_rgba(0,0,0,0.35)]
              "
            >
              {label}

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

