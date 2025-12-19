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
import DarkLogo from "../../assets/DarkLogo.png"
import LightLogo from "../../assets/LightLogo.jpeg"
import Sidebar_Toggle_Icon from "../../assets/Sidebar_Toggle_Icon.svg"
import BlackLogoutIcon from "../../assets/log-out-black.svg"
import WhiteLogoutIcon from "../../assets/log-out-white.svg"
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isCollapsed, onCollapse, isMobile, isMobileMenuOpen, setIsMobileMenuOpen, isRTL = false }) => {
  // Automatically set collapsed to false on mobile
  useEffect(() => {
    if (isMobile && isCollapsed) {
      onCollapse(false);
    }
  }, [isMobile, isCollapsed, onCollapse]);
  
  useEffect(() => {
  // Desktop: תמיד סגור כברירת מחדל (אייקונים בלבד)
  if (!isMobile && !isCollapsed) {
    onCollapse(true);
  }
}, [isMobile, isCollapsed, onCollapse]);


  const toggleDesktopSidebar = () => {
    onCollapse(!isCollapsed);
  };
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const userRole = useSelector(state => state.auth?.user?.role);
  const userSubscriptionStatus = useSelector(state => state.auth?.user?.subscriptionStatus);
  const userSubscriptionStartDate = useSelector(state => state.auth?.user?.subscriptionStartDate);
  const [showUpgradeCard, setShowUpgradeCard] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { language } = useLanguage();
  const t = getLayoutTranslations(language);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

// במובייל אין collapsed (תמיד מציג טקסט כשהתפריט פתוח)
// בדסקטופ: כשלא מרחפים -> collapsed, כשמרחפים -> לא collapsed
const effectiveCollapsed = isMobile ? false : !isHovering;

  const sidebarClasses = `
    font-ttcommons
    fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-screen 
    bg-white dark:bg-customBlack 
    ${isRTL ? 'border-l' : 'border-r'} border-gray-200 dark:border-commonBorder 
    flex flex-col z-[30]
    transition-all duration-300 ease-in-out
    h-[900px]
    group
    ${isMobile ?
      `w-[288px] ${isMobileMenuOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}` :
      `${isCollapsed ? 'w-16 hover:w-[288px]' : 'w-[288px]'}`
    }
  `;

  const navLinks = userRole === 'admin' ? adminNavLinks(language) : userNavLinks(language);

  // Check if upgrade card should be shown
  const shouldShowUpgradeCard = () => {
    // Don't show for admin
    if (userRole === 'admin') return false;
    
    // Don't show if user has active subscription
    if (userSubscriptionStatus === 'active') return false;
    
    // Don't show if subscription start date is in the future (user already subscribed)
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
        ></div>
      )}
      <aside
  className={sidebarClasses}
  onMouseEnter={() => setIsHovering(true)}
  onMouseLeave={() => setIsHovering(false)}
>
        {/* Header */}
        <div className={`flex items-center overflow-hidden h-[69px] md:h-[85px] px-4 relative ${isCollapsed ? 'justify-center group-hover:justify-between' : 'justify-between'}`}>
          {/* Logo for expanded state */}
          <div className={`flex items-center gap-[8px] ${isCollapsed ? 'hidden group-hover:flex' : 'flex'}`}>
            <span className={`text-20 font-testtiemposfine font-semibold text-gray-900 cursor-pointer dark:text-white transition-opacity duration-300`} onClick={handleLogoClick}>
              <img src={isDarkMode ? DarkLogo : LightLogo} alt="Logo" className="w-[100px] h-auto" />
            </span>
          </div>

          {/* Centered P for collapsed state */}
          <span className={`text-24 !font-testtiemposfine font-semibold text-gray-900 cursor-pointer dark:text-white transition-opacity duration-300 ${isCollapsed ? 'block group-hover:hidden' : 'hidden'}`} onClick={handleLogoClick}>
            P
          </span>

          {/* Toggle button for expanded state */}
          {isMobile && (
  <button
    type="button"
    onClick={() => setIsMobileMenuOpen(prev => !prev)}
    className="flex rounded-full p-1 shadow-lg z-[101]"
    aria-label="Toggle mobile menu"
  >
    <img src={Sidebar_Toggle_Icon} alt="Sidebar Toggle Icon" />
  </button>
)}


          {/* {!isMobile && (
            <button
              onClick={toggleDesktopSidebar}
              className={`flex absolute ${isRTL ? '-left-3' : '-right-3'} top-7 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-1 shadow-lg z-[101]`}
            >
              {isCollapsed ? (isRTL ? <MdChevronLeft size={16} /> : <MdChevronRight size={16} />) : (isRTL ? <MdChevronRight size={16} /> : <MdChevronLeft size={16} />)}
            </button>
          )} */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-hidden" onClick={() => isMobile && setIsMobileMenuOpen(false)}>
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

        {/* Upgrade Plan Card - only for non-subscribed users */}
        {shouldShowUpgradeCard() && showUpgradeCard && (
          <div className={`text-gray-700 dark:text-white transition-opacity duration-300 ${effectiveCollapsed ? 'hidden' : 'block'} p-4`}>
            <UpgradeCard onClose={() => setShowUpgradeCard(false)} />
          </div>
        )}

        {/* Logout */}
        {/* <div className="relative m-3">
          <button onClick={handleLogoutClick} className="w-full">
            <SidebarNavItem
              onClick={handleLogoutClick}
              icon={MdLogout}
              label={t.logout}
              isCollapsed={effectiveCollapsed}
              isRTL={isRTL}
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
