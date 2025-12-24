import React from "react";
import { NavLink } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { FiUsers, FiBarChart2, FiGrid, FiCreditCard } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

const BottomNav = ({ isRTL = false, basePath = "/app" }) => {
  const { language } = useLanguage();

  const items = [
    {
      to: `${basePath}/customers`,
      label: language === "he" ? "לקוחות" : "Customers",
      icon: FiUsers,
    },
    {
      to: `${basePath}/analytics`,
      label: language === "he" ? "אנליטיקס" : "Analytics",
      icon: FiBarChart2,
    },
    {
      to: `${basePath}/dashboard`,
      label: language === "he" ? "בית" : "Home",
      icon: IoHomeOutline,
      isHome: true,
    },
    {
      to: `${basePath}/qr-management`,
      label: language === "he" ? "QR" : "QR",
      icon: FiGrid,
    },
    {
      to: `${basePath}/subscription-and-billing`,
      label: language === "he" ? "מנוי" : "Billing",
      icon: FiCreditCard,
    },
  ];

  return (
    <nav
      dir="ltr"
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
        className="
          grid grid-cols-5
          items-center
        "
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.to} className="flex justify-center">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `
                  flex flex-col items-center justify-center
                  transition-all
                  ${
                    item.isHome
                      ? `
                        -mt-6
                        w-14 h-14
                        rounded-full
                        bg-[#ff257c]
                        text-white
                        shadow-lg
                      `
                      : `
                        py-3
                        ${
                          isActive
                            ? "text-[#ff257c]"
                            : "text-gray-500 dark:text-gray-300"
                        }
                      `
                  }
                `
                }
              >
                <Icon className={item.isHome ? "text-[26px]" : "text-[22px]"} />

                {!item.isHome && (
                  <span
                    dir={language === "he" ? "rtl" : "ltr"}
                    className="text-[11px] mt-1 leading-none"
                  >
                    {item.label}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;


