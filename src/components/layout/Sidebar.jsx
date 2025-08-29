import { MdLogout, MdChevronLeft, MdChevronRight, MdOutlineAdd } from 'react-icons/md';
import { IoHomeOutline } from 'react-icons/io5';
import UpgradeCard from './UpgradeCard';
import SidebarNavItem from './SidebarNavItem';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';
import userNavLinks from './UserNavLinks';
import adminNavLinks from './AdminNavLinks';
import { useState } from 'react';
import CommonConfirmModel from '../commonComponent/CommonConfirmModel';
import { useLanguage } from '../../context/LanguageContext';
import { getLayoutTranslations } from '../../utils/translations';
import { PiPlusBold } from 'react-icons/pi';
import DarkLogo from "../../assets/DarkLogo.png"
import LightLogo from "../../assets/LightLogo.jpeg"
import Sidebar_Toggle_Icon from "../../assets/Sidebar_Toggle_Icon.svg"
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isCollapsed, onCollapse, isMobile, isMobileMenuOpen, setIsMobileMenuOpen, isRTL = false }) => {
  const toggleDesktopSidebar = () => {
    onCollapse(!isCollapsed);
  };
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const userRole = useSelector(state => state.auth?.user?.role);
  const [showUpgradeCard, setShowUpgradeCard] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const sidebarClasses = `
    font-ttcommons
    fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-screen 
    bg-white dark:bg-customBlack 
    ${isRTL ? 'border-l' : 'border-r'} border-gray-200 dark:border-[#FFFFFF1A] 
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

  return (
    <span>
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[29]"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className={`flex items-center overflow-hidden h-[69px] md:h-[85px] px-4 relative ${isCollapsed ? 'justify-between' : ' justify-between'}`}>
          <div className='flex items-center gap-[8px]'>
            {/* <span className={`text-20 font-testtiemposfine font-semibold text-gray-900 dark:text-white transition-opacity duration-300 ${isCollapsed ? 'hidden group-hover:inline' : 'inline'}`}>
              {effectiveCollapsed && (
                <span className={`fixed ${isRTL ? 'right-[4.5rem]' : 'left-[4.5rem]'} px-3 py-2 bg-gray-800 dark:bg-[#2C2C2C] text-white text-sm rounded-md transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap ${isRTL ? 'translate-x-[20px] group-hover:translate-x-0' : 'translate-x-[-20px] group-hover:translate-x-0'} z-[9999] shadow-lg`}>
                  {t.plusFive}
                </span>
              )}
            </span> */}
            <span className={`text-20 font-testtiemposfine font-semibold text-gray-900 cursor-pointer dark:text-white transition-opacity duration-300 ${isCollapsed ? 'hidden group-hover:inline' : 'inline'}`} onClick={handleLogoClick}>
              <img src={isDarkMode ? DarkLogo : LightLogo} alt="Logo" className="w-[100px] h-auto" />
            </span>
            <span className={`text-20 font-testtiemposfine font-semibold text-gray-900 cursor-pointer dark:text-white transition-opacity duration-300 ${isCollapsed ? 'inline group-hover:hidden' : 'hidden'}`} onClick={handleLogoClick}>
              P
            </span>
          </div>

          {!isMobile && (
            <button
              onClick={toggleDesktopSidebar}
              className={`flex text-white rounded-full p-1 shadow-lg z-[101] ${isCollapsed ? 'hidden group-hover:flex' : 'flex'}`}
            >
              <img src={Sidebar_Toggle_Icon} alt="Sidebar Toggle Icon" className="" />
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
                showHoverText={isCollapsed}
              />
            ))}
          </ul>
        </nav>

        {/* Upgrade Plan Card - only for user role and if not closed */}
        {userRole !== 'admin' && showUpgradeCard && (
          <div className={`text-gray-700 dark:text-white transition-opacity duration-300 ${effectiveCollapsed ? 'hidden' : 'block'} p-4`}>
            <UpgradeCard onClose={() => setShowUpgradeCard(false)} />
          </div>
        )}

        {/* Logout */}
        <div className="relative m-3">
          <button onClick={handleLogoutClick} className="w-full">
            <SidebarNavItem
              onClick={handleLogoutClick}
              icon={MdLogout}
              label={t.logout}
              isCollapsed={effectiveCollapsed}
              isRTL={isRTL}
            />
          </button>
        </div>
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