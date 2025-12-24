import { MdLogout, MdChevronLeft, MdChevronRight, MdOutlineAdd } from 'react-icons/md';
import { IoHomeOutline } from 'react-icons/io5';
import UpgradeCard from './UpgradeCard';
import SidebarNavItem from './SidebarNavItem';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';
import userNavLinks from './UserNavLinks';
import adminNavLinks from './AdminNavLinks';
import { useState, useEffect } from 'react';
import CommonConfirmModel from '../commonComponent/CommonConfirmModel';
import { useLanguage } from '../../context/LanguageContext';
import { getLayoutTranslations } from '../../utils/translations';
import { PiPlusBold } from 'react-icons/pi';
import DarkLogo from "../../assets/DarkLogo.png";
import LightLogo from "../../assets/LightLogo.jpeg";
import BlackLogoutIcon from "../../assets/log-out-black.svg";
import WhiteLogoutIcon from "../../assets/log-out-white.svg";
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isCollapsed, onCollapse, isMobile, isMobileMenuOpen, setIsMobileMenuOpen, isRTL = false }) => {

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

  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userRole = useSelector(state => state.auth?.user?.role);
  const userSubscriptionStatus = useSelector(state => state.auth?.user?.subscriptionStatus);
  const userSubscriptionStartDate = useSelector(state => state.auth?.user?.subscriptionStartDate);

  const [showUpgradeCard, setShowUpgradeCard] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { language } = useLanguage();
  const t = getLayoutTranslations(language);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const sidebarClasses = `
    font-ttcommons
    fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-screen 
    bg-white dark:bg-customBlack 
    ${isRTL ? 'border-l' : 'border-r'} border-gray-200 dark:border-commonBorder 
    flex flex-col z-[30]
    transition-all duration-300 ease-in-out
    h-[900px]
    group
    ${isMobile
      ? `w-[288px] ${isMobileMenuOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`
      : `${isCollapsed ? 'w-24 hover:w-[288px]' : 'w-[288px]'}`
    }
  `;

  const navLinks = userRole === 'admin'
    ? adminNavLinks(language)
    : userNavLinks(language);

  const shouldShowUpgradeCard = () => {
    if (userRole === 'admin') return false;
    if (userSubscriptionStatus === 'active') return false;

    if (userSubscriptionStartDate) {
      const startDate = new Date(userSubscriptionStartDate);
      if (startDate > new Date()) return false;
    }

    return true;
  };

  return (
    <span>
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[29]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div
          className={`flex items-center overflow-hidden h-[69px] md:h-[85px] px-4 relative ${
            isCollapsed ? 'justify-center group-hover:justify-between' : 'justify-between'
          }`}
        >
          {/* Logo – מופיע רק ב-hover / expanded */}
          <div className={`flex items-center gap-[8px] ${isCollapsed ? 'hidden group-hover:flex' : 'flex'}`}>
            <span
              className="text-20 font-testtiemposfine font-semibold text-gray-900 cursor-pointer dark:text-white transition-opacity duration-300"
              onClick={handleLogoClick}
            >
              <img src={isDarkMode ? DarkLogo : LightLogo} alt="Logo" className="w-[100px] h-auto" />
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-hidden">
          <ul className="space-y-3 px-2 list-none">
            {navLinks.map((link) => (
              <SidebarNavItem
                key={link.to}
                {...link}
                isCollapsed={effectiveCollapsed}
                isRTL={isRTL}
                showHoverText={effectiveCollapsed}
              />
            ))}
          </ul>
        </nav>

        {/* Upgrade Card */}
        {shouldShowUpgradeCard() && showUpgradeCard && (
          <div className={`text-gray-700 dark:text-white transition-opacity duration-300 ${effectiveCollapsed ? 'hidden' : 'block'} p-4`}>
            <UpgradeCard onClose={() => setShowUpgradeCard(false)} />
          </div>
        )}
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

