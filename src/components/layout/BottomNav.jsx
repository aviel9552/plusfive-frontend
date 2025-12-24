import React from "react";
import { NavLink } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { FiUsers, FiBarChart2, FiSettings } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

const BottomNav = ({ isRTL = false, basePath = "/app" }) => {
  const { language } = useLanguage();

  // שנה את הנתיבים פה למה שיש אצלך בפועל
  const items = [
    { to: `${basePath}/dashboard`, label: language === "he" ? "בית" : "Home", icon: IoHomeOutline },
    { to: `${basePath}/customers`, label: language === "he" ? "לקוחות" : "Customers", icon: FiUsers },
    { to: `${basePath}/analytics`, label: language === "he" ? "אנליטיקס" : "Analytics", icon: FiBarChart2 },
    { to: `${basePath}/account-settings`, label: language === "he" ? "הגדרות" : "Settings", icon: FiSettings },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 w-full
        z-[60]
        border-t border-gray-200 dark:border-commonBorder
        bg-white dark:bg-customBlack
        lg:hidden
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <ul className={`grid grid-cols-4 ${isRTL ? "direction-rtl" : ""}`}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `
                  flex flex-col items-center justify-center
                  py-3
                  transition-colors
                  ${isActive ? "text-[#ff257c]" : "text-gray-500 dark:text-gray-300"}
                  `
                }
              >
                <Icon className="text-[22px]" />
                <span className="text-[11px] mt-1 leading-none">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
