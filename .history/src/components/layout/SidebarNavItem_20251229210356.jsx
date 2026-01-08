import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

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

  // 🔥 לוג דיבאג – אם זה לא מופיע בקונסול, הקובץ לא רץ בכלל
  console.log(">>> SIDEBAR NAV ITEM RENDERED:", label);

  const isActive = () => {
    if (location.pathname === to) return true;

    return specialPaths.some((path) => {
      if (path.includes(":")) {
        const basePath = path.split(":")[0];
        return location.pathname.startsWith(basePath);
      }
      return location.pathname === path;
    });
  };

  const getLinkClasses = () => {
    return `
      flex items-center w-full rounded-lg relative group transition-colors duration-200
      ${isCollapsed ? "justify-center" : "px-3 py-2"}
      ${
        isActive()
          ? ""
          : "text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white"
      }
    `;
  };

  const getIconClasses = () => {
    return "text-22 lg:text-20 text-white";
  };

  const renderIcon = () => {
    if (customIcon) {
      if (
        typeof customIcon === "object" &&
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

  return (
    <>
      {/* 🔴 שכבת DEBUG ענקית – אם אתה רואה אותה, הקובץ רץ בוודאות */}
      <div className="fixed top-0 left-0 z-[999999] bg-red-600 text-white px-4 py-2 text-sm">
        DEBUG: SidebarNavItem.jsx נטען (label: {label})
      </div>

      <li className="relative list-none">
        {/* Tooltip דפדפן בסיסי */}
        <Link
          to={to}
          className={getLinkClasses()}
          title={`${label} (tooltip)`}
        >
          {/* אייקון */}
          <span
            className={`
              flex items-center justify-center
              w-11 h-11 rounded-lg
              transition-colors duration-200
              ${
                isActive()
                  ? "bg-[#ff257c]/85"
                  : "hover:bg-[#2c2c2c] dark:hover:bg-[#212121]"
              }
            `}
          >
            {renderIcon()}
          </span>

          {/* טקסט – עם שינוי אגרסיבי שנראה מיד */}
          <span
            className={`
              transition-opacity duration-300 text-16 font-bold uppercase
              ${isActive() ? "text-yellow-300" : "text-lime-300"}
              ${isCollapsed ? "hidden" : isRTL ? "mr-2" : "ml-2"}
            `}
          >
            {label} [DEBUG]
          </span>
        </Link>
      </li>
    </>
  );
};

export default SidebarNavItem;
