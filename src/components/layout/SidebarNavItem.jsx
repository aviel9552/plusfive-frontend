import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const SidebarNavItem = ({ to, icon: Icon, label, isCollapsed, specialPaths = [], isRTL = false, showHoverText = false, customIcon = null }) => {
    const location = useLocation();
    const { isDarkMode } = useTheme();

    const isActive = () => {
        // Check exact match first
        if (location.pathname === to) {
            return true;
        }

        // Check special paths with dynamic route support
        return specialPaths.some(path => {
            // If path contains :userId or similar parameter, check if current path starts with the base path
            if (path.includes(':')) {
                const basePath = path.split(':')[0];
                return location.pathname.startsWith(basePath);
            }
            // Otherwise do exact match
            return location.pathname === path;
        });
    };

    const getLinkClasses = () => {
  return `flex items-center w-full px-3 py-2 rounded-lg relative group transition-colors duration-200
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
    if (customIcon) {
        // If customIcon is an object with dark and light variants
        if (typeof customIcon === 'object' && customIcon.dark && customIcon.light) {
            const iconSrc = isDarkMode ? customIcon.dark : customIcon.light;
            return (
                <img
                    src={iconSrc}
                    alt=""
                    className={`w-5 h-5 ${isActive() ? 'brightness-0 invert' : ''}`}
                />
            );
        }
        // If customIcon is a single image
        return (
            <img
                src={customIcon}
                alt=""
                className={`w-5 h-5 ${isActive() ? 'brightness-0 invert' : ''}`}
            />
        );
    }
    // Fallback to regular icon
    return <Icon className={getIconClasses()} />;
    };

    return (
        <li className="relative list-none">
            <Link to={to} className={getLinkClasses()}>
                <span className='flex items-center gap-[8px]'>
                    {renderIcon()}
                    <span
  className={`transition-opacity duration-300 text-16 ${
    isActive() ? 'text-white' : 'text-gray-700 dark:text-white'
  } ${isCollapsed ? 'hidden' : 'inline'}`}
>
  {label}
</span>

                </span>
                {/* {isCollapsed && !showHoverText && (
                    <span className={`fixed ${isRTL ? 'right-[4.5rem]' : 'left-[4.5rem]'} px-3 py-2 bg-gray-800 dark:bg-[#212121] text-white text-sm rounded-md
                    transition-all duration-300 ease-in-out
                    opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap ${isRTL ? 'translate-x-[20px] group-hover:translate-x-0' : 'translate-x-[-20px] group-hover:translate-x-0'} 
                    z-[9999] shadow-lg`}>
                        {label}
                    </span>
                )} */}
            </Link>
        </li>
    );
};

export default SidebarNavItem; 
