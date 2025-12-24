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
import DarkLogo from '../../assets/DarkLogo.png';
import LightLogo from '../../assets/LightLogo.jpeg';
import Sidebar_Toggle_Icon from '../../assets/Sidebar_Toggle_Icon.svg';
import BlackLogoutIcon from '../../assets/log-out-black.svg';
import WhiteLogoutIcon from '../../assets/log-out-white.svg';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({
  isCollapsed,
  onCollapse,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isRTL = false, // נשאר רק אם SidebarNavItem צריך RTL פנימי לטקסט
}) => {
  // ✅ Mobile: לא קורסים (תמיד פתוח כשמובייל)
  useEffect(() => {
    if (isMobile && isCollapsed) {
      onCollapse(false);
    }
  }, [isMobile, isCollapsed, onCollapse]);

  // ✅ Desktop: תמיד סגור כברירת מחדל (אייקונים בלבד)
  useEffect(() => {
    if (!isMobile && !isCollapsed) {
      onCollapse(true);
    }
  }, [isMobile, isCollapsed, onCollapse]);

  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userRole = useSelector((state) => state.auth?.user?.role);
  const userSubscriptionStatus = useSelector((state) => state.auth?.user?.subscriptionStatus);
  const userSubscriptionStartDate = useSelector((state) => state.auth?.user?.subscriptionStartDate);

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

  // ✅ במובייל: לא collapsed (כי זה תפריט מלא)
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  // ✅ טולטיפים רק בדסקטופ כשהסיידבר collapsed
  const showHoverText = !isMobile && effectiveCollapsed;

  // ✅ סיידבר תמיד LEFT (לא תלוי RTL)
  const sidebarClasses = `
    font-ttcommons
    fixed left-0 top-0 h-screen
    bg-[#141414] dark:bg-customBlack
    border-r border-gray-200 dark:border-commonBorder
    flex flex-col z-[30]
    transition-all duration-300 ease-in-out
    h-[900px]
    ${
      isMobile
        ? `w-[288px] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
        : 'w-[72px]'
    }
  `;

  const navLinks = userRole === 'admin' ? adminNavLinks(language) : userNavLinks(language);

  const shouldShowUpgradeCard = () => {
    if (userRole === 'admin') return false;
    if (userSubscriptionStatus === 'active') return false;

    if (userSubscriptionStartDate) {
      const startDate = new Date(userSubscriptionStartDate);
      const now = new Date();
      if (startDate > now) return false;
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
            effectiveCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {/* Logo רק כשלא collapsed */}
          <div className={`flex items-center gap-[8px] ${effectiveCollapsed ? 'hidden' : 'flex'}`}>
            <span
              className="text-20 font-testtiemposfine font-semibold text-gray-900 cursor-pointer dark:text-white transition-opacity duration-300"
              onClick={handleLogoClick}
            >
              <img src={isDarkMode ? DarkLogo : LightLogo} alt="Logo" className="w-[100px] h-auto" />
            </span>
          </div>

          {/* P במצב collapsed */}
          <span
            className={`text-24 !font-testtiemposfine font-semibold text-gray-900 cursor-pointer dark:text-white transition-opacity duration-300 ${
              effectiveCollapsed ? 'block' : 'hidden'
            }`}
            onClick={handleLogoClick}
          >
            P
          </span>
        </div>

        {/* NAVIGATION */}
        <nav
          // ✅ בדסקטופ חייב overflow-visible כדי שהטולטיפ לא ייחתך
          className={`flex-1 ${isMobile ? 'overflow-hidden' : 'overflow-visible'}`}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          <ul
            // ✅ חשוב: overflow-visible גם כאן, כדי שלא ייחתך tooltip
            className={`space-y-3 list-none overflow-visible ${effectiveCollapsed ? 'px-0' : 'px-2'}`}
          >
            {navLinks.map((link) => (
              <SidebarNavItem
                key={link.to}
                {...link}
                isCollapsed={effectiveCollapsed}
                isRTL={isRTL}
                // ✅ זה השינוי שמדליק את הצ׳ופצ׳יקים
                showHoverText={showHoverText}
              />
            ))}
          </ul>
        </nav>

        {/* Upgrade Plan Card */}
        {shouldShowUpgradeCard() && showUpgradeCard && (
          <div className={`text-gray-700 dark:text-white transition-opacity duration-300 ${effectiveCollapsed ? 'hidden' : 'block'} p-4`}>
            <UpgradeCard onClose={() => setShowUpgradeCard(false)} />
          </div>
        )}

        {/* Logout (כבוי אצלך) */}
        {/* <div className="relative m-3">
          <button onClick={() => setShowLogoutModal(true)} className="w-full">
            <SidebarNavItem
              onClick={() => setShowLogoutModal(true)}
              icon={MdLogout}
              label={t.logout}
              isCollapsed={effectiveCollapsed}
              isRTL={isRTL}
              showHoverText={showHoverText}
              customIcon={{
                light: BlackLogoutIcon,
                dark: WhiteLogoutIcon
              }}
            />
          </button>
        </div> */}
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


