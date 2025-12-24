import { useState, useRef, useEffect } from 'react';
import {
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiMenu,
  FiEdit2,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { CommonNormalDropDown } from '../index';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import userNavLinks, { specialPageTitles as userSpecialTitles } from './UserNavLinks';
import adminNavLinks, { specialPageTitles as adminSpecialTitles } from './AdminNavLinks';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/actions/authActions';
import CommonConfirmModel from '../commonComponent/CommonConfirmModel';
import { getLayoutTranslations } from '../../utils/translations';

// ✅ לוגו (תבחר אחד / לפי theme)
import DarkLogo from '../../assets/DarkLogo.png';
import LightLogo from '../../assets/LightLogo.jpeg';

const Header = ({ onMobileMenuToggle }) => {
  const user = useSelector((state) => state.auth?.user);
  const userName = user?.name || user?.firstName || 'User';

  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(4);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const languageOptions = [
    { value: 'en', shortLabel: 'En', label: 'English', code: 'en', fullName: 'English' },
    { value: 'he', shortLabel: 'He', label: 'Hebrew', code: 'he', fullName: 'Hebrew' },
  ];

  const notifications = [
    { id: 1, name: 'UI/UX Design', time: '2 min ago', message: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.", avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, name: 'Message', time: '1 hour ago', message: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.", avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 3, name: 'Forms', time: '2 hour ago', message: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.", avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 4, name: 'Challenge invitation', time: '12 hour ago', message: 'Jonny aber invites to join the challenge', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: 5, name: 'Payment', time: '1 day ago', message: 'Your payment was successful.', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: 6, name: 'Security', time: '2 days ago', message: 'Password changed successfully.', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
  ];

  const toggleNotifications = () => setShowNotifications((prev) => !prev);
  const toggleProfileMenu = () => setShowProfileMenu((prev) => !prev);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  // ✅ לחיצה על לוגו (כמו Fresha -> חוזר ל-dashboard)
  const handleLogoClick = () => {
    const isAdmin = user?.role === 'admin';
    navigate(isAdmin ? '/admin/dashboard' : '/app/dashboard');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const userRole = useSelector((state) => state.auth?.user?.role);
  const navLinks = userRole === 'admin' ? adminNavLinks(language) : userNavLinks(language);
  const specialTitles = userRole === 'admin' ? adminSpecialTitles : userSpecialTitles;

  const currentNav = navLinks.find(
    (link) =>
      link.to === location.pathname ||
      (link.specialPaths && link.specialPaths.includes(location.pathname))
  );

  let pageTitle = '';
  const dynamicTitle = Object.keys(specialTitles || {}).find((titlePath) => {
    if (titlePath.includes(':')) {
      const basePath = titlePath.split(':')[0];
      return location.pathname.startsWith(basePath);
    }
    return false;
  });

  if (dynamicTitle && specialTitles[dynamicTitle]) pageTitle = specialTitles[dynamicTitle];
  else if (specialTitles && specialTitles[location.pathname]) pageTitle = specialTitles[location.pathname];
  else if (currentNav) pageTitle = currentNav.label;
  else pageTitle = 'Page';

  const isAdmin = userRole === 'admin';
  const accountSettingsLink = isAdmin ? '/admin/account-settings' : '/app/account-settings';
  const supportLink = isAdmin ? '/admin/support-and-help' : '/app/support-and-help';
  const isRTL = language === 'he';
  const t = getLayoutTranslations(language);

  return (
    <header
      className="
        fixed top-0 left-0
        w-full
        bg-white dark:bg-customBlack
        h-[72px] lg:h-[66px]
        border-b border-gray-200 dark:border-commonBorder
        z-[40]
        font-ttcommons
      "
    >
      <div
        className={`
          h-full
          px-4 lg:px-6
          flex items-center justify-between
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
      >
        {/* LEFT SIDE */}
        <div className={`h-full flex items-center gap-1 ${isRTL ? 'order-2' : 'order-1'}`}>
          {/* ✅ LOGO כמו Fresha */}
          <button
            onClick={handleLogoClick}
            className="h-full flex items-center"
            aria-label="Go to dashboard"
          >
            <img
              src={isDarkMode ? DarkLogo : LightLogo}
              alt="Logo"
              className="h-[22px] lg:h-[28px] w-auto object-contain"
            />
          </button>

          {/* Mobile menu */}
          <button
            onClick={onMobileMenuToggle}
            className={`
              w-10 h-10
              flex items-center justify-center
              text-gray-700 dark:text-white
              hover:bg-gray-100 dark:hover:bg-customIconBgColor
              rounded-lg
              lg:hidden
              transition-colors duration-200
            `}
            aria-label="Open sidebar"
          >
            <FiMenu size={22} />
          </button>

          <div className="hidden lg:block">
            {/* אם תרצה כותרת ליד הלוגו:
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{pageTitle}</div>
            */}
          </div>
        </div>

        {/* RIGHT SIDE (ICONS) */}
        <div
          className={`
            h-full
            flex items-center
            gap-2 lg:gap-4
            ${isRTL ? 'order-1 mr-auto' : 'order-2 ml-auto'}
          `}
        >
          <div className="h-full flex items-center">
            <CommonNormalDropDown
              options={languageOptions}
              value={language}
              onChange={changeLanguage}
              className="flex p-1"
              showIcon={true}
              borderRadius="rounded-full"
              inputBorderRadius="rounded-full"
              fontSize="text-14"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-customIconBgColor rounded-full transition-colors duration-200"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <FiSun className="text-xl text-white" /> : <FiMoon className="text-xl text-gray-700" />}
          </button>

          <button
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-customIconBgColor rounded-full relative transition-colors duration-200"
            onClick={toggleNotifications}
          >
            <FiBell className="text-xl text-gray-700 dark:text-white" />
          </button>

          <button
            className="w-10 h-10 flex items-center justify-center"
            onClick={toggleProfileMenu}
          >
            <div className="w-10 h-10 rounded-full bg-[#ff257c] flex items-center justify-center text-white font-bold text-base">
              {userName.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div
          ref={notificationRef}
          className={`
            fixed
            top-20
            ${isRTL ? 'left-2' : 'right-2'}
            w-[70%]
            sm:top-20
            ${isRTL ? 'sm:left-8' : 'sm:right-8'}
            sm:w-[420px]
            ${isRTL ? 'sm:right-auto' : 'sm:left-auto'}
            sm:mx-0
            mx-auto
            sm:max-h-[80vh]
            max-h-[60vh]
            bg-white dark:bg-customBrown
            shadow-2xl rounded-2xl border border-gray-200 dark:border-customBorderColor
            z-[1200]
            overflow-y-auto
          `}
          style={{ minWidth: 0 }}
        >
          <div className="p-4 border-b border-gray-100 dark:border-customBorderColor font-bold text-gray-700 dark:text-white">
            {t.notifications}
          </div>

          <div className="divide-y divide-gray-100 dark:divide-customBorderColor">
            {/* (השארת רשימה כבויה אצלך) */}
          </div>

          {visibleCount < notifications.length && (
            <button
              className="w-full py-2 text-blue-600 font-semibold hover:underline"
              onClick={() => setVisibleCount((c) => c + 4)}
            >
              Load More
            </button>
          )}
          {visibleCount > 4 && (
            <button
              className="w-full py-2 text-blue-600 font-semibold hover:underline"
              onClick={() => setVisibleCount(4)}
            >
              Show Less
            </button>
          )}
        </div>
      )}

      {/* Profile Dropdown */}
      {showProfileMenu && (
        <div
          ref={profileMenuRef}
          className={`absolute ${isRTL ? 'md:left-10 left-2' : 'md:right-10 right-2'} mt-2 w-auto sm:w-72 bg-white dark:bg-customBlack rounded-2xl shadow-2xl border border-gray-200 dark:border-customBorderColor z-[1200] p-0 overflow-hidden`}
        >
          <div className="flex flex-col items-center py-5 px-6 bg-white dark:bg-customBlack">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold bg-[#ff257c] text-white mb-2 shadow">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-lg">{userName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@email.com'}</div>
          </div>

          <div className="py-2 bg-white dark:bg-customBlack">
            <Link
              to={accountSettingsLink}
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#232323] transition-colors text-gray-700 dark:text-white text-base"
              onClick={() => setShowProfileMenu(false)}
            >
              <FiEdit2 className="text-lg text-gray-500 dark:text-gray-300" />
              {t.profile}
            </Link>

            <Link
              to={accountSettingsLink}
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#232323] transition-colors text-gray-700 dark:text-white text-base"
              onClick={() => setShowProfileMenu(false)}
            >
              <FiSettings className="text-lg text-gray-500 dark:text-gray-300" />
              {t.accountSettings}
            </Link>

            <Link
              to={supportLink}
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#232323] transition-colors text-red-500 dark:text-red-400 text-base"
              onClick={() => setShowProfileMenu(false)}
            >
              <FiHelpCircle className="text-lg text-red-500 dark:text-red-400" />
              {t.supportAndHelp}
            </Link>
          </div>

          <hr className="border-gray-200 dark:border-customBorderColor my-0" />

          <button
            className="flex items-center gap-3 px-6 py-3 w-full hover:bg-red-50 dark:hover:bg-[#3a2323] transition-colors text-red-600 dark:text-red-400 font-semibold text-base"
            onClick={() => setShowLogoutModal(true)}
          >
            <FiLogOut className="text-lg" />
            {t.logout}
          </button>
        </div>
      )}

      <CommonConfirmModel
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title={t.logoutConfirm}
        message={t.logoutMessage}
      />
    </header>
  );
};

export default Header;

