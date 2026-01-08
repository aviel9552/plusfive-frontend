import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import UpgradeCard from "./UpgradeCard";
import SidebarNavItem from "./SidebarNavItem";
import { logoutUser } from "../../redux/actions/authActions";
import userNavLinks from "./UserNavLinks";
import adminNavLinks from "./AdminNavLinks";
import CommonConfirmModel from "../commonComponent/CommonConfirmModel";
import { useLanguage } from "../../context/LanguageContext";
import { getLayoutTranslations } from "../../utils/translations";
import DarkLogo from "../../assets/DarkLogo.png";
import LightLogo from "../../assets/LightLogo.jpeg";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = ({
  isCollapsed,
  onCollapse,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isRTL = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

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

  // סינכרון מובייל / דסקטופ עם מצב collapse
  useEffect(() => {
    if (isMobile && isCollapsed) {
      onCollapse(false);
    }
  }, [isMobile, isCollapsed, onCollapse]);

  useEffect(() => {
    if (!isMobile && !isCollapsed) {
      onCollapse(true);
    }
  }, [isMobile, isCollapsed, onCollapse]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  // במובייל תמיד פתוח, בדסקטופ לפי isCollapsed
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const sidebarClasses = `
    font-ttcommons
    fixed ${isRTL ? "right-0" : "left-0"} top-0 h-screen
    bg-white dark:bg-customBlack
    ${isRTL ? "border-l" : "border-r"} border-gray-200 dark:border-commonBorder
    flex flex-col z-[30]
    transition-all duration-300 ease-in-out
    h-[900px]
    group
    ${
      isMobile
        ? `w-[288px] ${
            isMobileMenuOpen
              ? "translate-x-0"
              : isRTL
              ? "translate-x-full"
              : "-translate-x-full"
          }`
        : "w-24"
    }
  `;

  const navLinks =
    userRole === "admin" ? adminNavLinks(language) : userNavLinks(language);

  const shouldShowUpgradeCard = () => {
    if (userRole === "admin") return false;
    if (userSubscriptionStatus === "active") return false;

    if (userSubscriptionStartDate) {
      const startDate = new Date(userSubscriptionStartDate);
      if (startDate > new Date()) return false;
    }

    return true;
  };

  return (
    <span>
      {/* Overlay במובייל */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[29]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {/* HEADER – לוגו */}
        <div
          className={`flex items-center overflow-hidden h-[69px] md:h-[85px] px-4 relative ${
            effectiveCollapsed
              ? "justify-center group-hover:justify-between"
              : "justify-between"
          }`}
        >
          <div
            className={`flex items-center gap-[8px] ${
              effectiveCollapsed ? "hidden group-hover:flex" : "flex"
            }`}
          >
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex items-center gap-2"
            >
              <img
                src={isDarkMode ? DarkLogo : LightLogo}
                alt="Logo"
                className="w-[100px] h-auto"
              />
            </button>
          </div>
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

        {/* Upgrade box only for unpaid users */}
        {shouldShowUpgradeCard() && showUpgradeCard && (
          <div
            className={`text-gray-700 dark:text-white transition-opacity duration-300 ${
              effectiveCollapsed ? "hidden" : "block"
            } p-4`}
          >
            <UpgradeCard onClose={() => setShowUpgradeCard(false)} />
          </div>
        )}

        {/* LOGOUT BUTTON (אם יש לך כזה – השארתי דוגמא) */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <MdLogout className="text-lg" />
          {!effectiveCollapsed && <span>{t.logout}</span>}
        </button>
      </aside>

      <CommonConfirmModel
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title={t.logoutConfirm}
        message={t.logoutMessage}
      />
    </span>
  );
};

export default Sidebar;
