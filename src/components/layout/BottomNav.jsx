import React from "react";
import { NavLink } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import { FiBarChart2 } from "react-icons/fi";
import { FiCreditCard } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

const BottomNav = ({ isRTL = false, basePath = "/app" }) => {
  const { language } = useLanguage();

  const items = [
    {
      to: `${basePath}`,
      label: language === "he" ? "בית" : "Home",
      icon: IoHomeOutline,
    },
    {
      to: `${basePath}/customers`,
      label: language === "he" ? "לקוחות" : "Customers",
      icon: FiUsers,
    },
    {
      to: `${basePath}/qr-management`,
      label: language === "he" ? "QR" : "QR",
      icon: MdQrCode2,
    },
    {
      to: `${basePath}/analytics`,
      label: language === "he" ? "אנליטיקס" : "Analytics",
      icon: FiBarChart2,
    },
    {
      to: `${basePath}/subscription-and-billing`,
      label: language === "he" ? "מנוי" : "Billing",
      icon: FiCreditCard,
    },
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
      <ul
        className={`
          grid grid-cols-5
          ${isRTL ? "direction-rtl" : ""}
        `}
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `
                  flex flex-col items-center justify-center
                  py-3
                  transition-colors
                  ${
                    isActive
                      ? "text-[#ff257c]"
                      : "text-gray-500 dark:text-gray-300"
                  }
                  `
                }
              >
                <Icon className="text-[22px]" />
                <span className="text-[11px] mt-1 leading-none">
                  {item.label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
