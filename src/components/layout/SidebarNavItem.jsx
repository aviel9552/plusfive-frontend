import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarNavItem = ({ to, icon: Icon, label, isCollapsed, specialPaths = [], isRTL = false, showHoverText = false }) => {
    const location = useLocation();

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
        ${isActive()
                ? `bg-gray-200 dark:bg-[#212121] text-gray-900 dark:text-white`
                : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#212121] hover:text-gray-900 dark:hover:text-white'
            }`;
    };

    const getIconClasses = () => {
        return `text-22 lg:text-20  ${isActive() ? 'text-gray-900 dark:text-white' : ''}`;
    }

    return (
        <li className="relative list-none">
            <Link to={to} className={getLinkClasses()}>
                <span className='flex items-center gap-[8px]'>
                    <Icon className={getIconClasses()} />
                    <span className={`text-gray-700 dark:text-white transition-opacity duration-300 text-16 mt-1 ${isCollapsed ? 'hidden group-hover:inline' : 'inline'}`}>
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