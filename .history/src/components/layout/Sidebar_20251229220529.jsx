import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { getLayoutTranslations } from "../../utils/translations";
import { useTheme } from "../../context/ThemeContext";

import { logoutUser } from "../../redux/actions/authActions";

import SidebarNavItem from "./SidebarNavItem";
import UpgradeCard from "./UpgradeCard";
import CommonConfirmModel from "../commonComponent/CommonConfirmModel";

import userNavLinks from "./UserNavLinks";
import adminNavLinks from "./AdminNavLinks";

import DarkLogo from "../../assets/DarkLogo.png";
import LightLogo from "../../assets/LightLogo.jpeg";

import { LuCalendarClock } from "react-icons/lu";

const Sidebar = ({
  isCollapsed,
  onCollapse,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isRTL = false,
}) => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getLayoutTranslations(language);

  const userRole = useSelector((state) => state.auth?.user?.role);
  const userSubscriptionStatus = useSelector(
    (state) => state.auth?.user?.subscriptionStatus
  );
  const userSubscriptionStartDate = useSelector(
    (state) => state.auth?.user?.subscriptionStartDate
  );

  const [showUpgradeCard, setShowUpgradeCard] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // MOBILE: Sidebar open/full
  useEffect(() => {
    if (isMobile && isCollapsed) onCollapse(false);
  }, [isMobile, isCollapsed, onCollapse]);

  // DESKTOP: Sidebar collapsed by default
  useEffect(() => {
    if (!isMobile && !isCollapsed) onCollapse(true);
  }, [isMobile, isCollapsed, onCollapse]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const shouldShowUpgradeCard = () => {
    if (userRole === "admin") return false;
    if (userSubscriptionStatus === "active") return false;

    if (userSubscriptionStartDate) {
      const startDate = new Date(userSubscriptionStartDate);
      if (startDate > new Date()) return false;
    }

    return true;
  };

  const navLinks = userRole === "admin" ? adminNavLinks(language) : userNavLinks(language);

  /* -------------------  SIDEBAR UI ------------------- */

  const sidebarClasses = `
    font-ttcommons 
    fixed ${isRTL ? "right-0" : "left-0"} top-0 
    h-screen bg-[#141414] dark:bg-customBlack 
    ${isRTL ? "border-l" : "border-r"} border-gray-200 dark:border-commonBorder
    flex flex-col z-[30]
    transition-all duration-300 ease-in-out
    ${isMobile ? `w-[288px] ${isMobileMenuOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}` : "w-[72px]"}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[29]" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className={`flex items-center h-[85px] px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <span className="cursor-pointer" onClick={() => navigate("/")}>
              <img src={isDarkMode ? DarkLogo : LightLogo} className="w-[100px]" />
            </span>
          )}
          {isCollapsed && (
            <span className="text-2xl text-white cursor-pointer" onClick={() => navigate("/")}>P</span>
          )}
        </div>

        {/* NAVIGATION */}
<nav
  className="flex-1 overflow-y-auto overflow-x-visible"
  onClick={() => isMobile && setIsMobileMenuOpen(false)}
>
  <ul
    className={`${
      effectiveCollapsed ? "px-0" : "px-2"
    } space-y-3 list-none`}
  >
    {navLinks.map((link) => (
      <SidebarNavItem
        key={link.to}
        {...link}
        isCollapsed={effectiveCollapsed}
        isRTL={isRTL}
      />
    ))}
  </ul>
</nav>


            {/* ⭐️ Calendar Nav Item */}
            <SidebarNavItem
              to="/app/calendar"
              icon={LuCalendarClock}
              label="Calendar"
              isCollapsed={isCollapsed}
              isRTL={isRTL}
            />
          </ul>
        </nav>

        {/* Upgrade box only for unpaid users */}
        {shouldShowUpgradeCard() && !isCollapsed && (
          <div className="p-4"><UpgradeCard onClose={() => setShowUpgradeCard(false)} /></div>
        )}

      </aside>

      <CommonConfirmModel
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title={t.logoutConfirm}
        message={t.logoutMessage}
      />
    </>
  );
};

export default Sidebar;
