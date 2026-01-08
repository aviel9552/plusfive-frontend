import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
// import Footer from './Footer';
import { useLanguage } from '../../context/LanguageContext';
import BottomNav from './BottomNav';
import { useLocation } from 'react-router-dom';
import { BusinessProfileCard } from '../accountSettings/BusinessProfileCard';

const Layout = ({ children }) => {
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showBusinessProfile, setShowBusinessProfile] = useState(false);
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const location = useLocation();

  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/app';

  // ✅ בונוס קטן: לא מציג BottomNav בדפים שלא צריכים
  const hideBottomNav =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname.startsWith('/auth');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCalendarClientsPage = location.pathname === '/app/calendar-clients' || location.pathname === '/calendar-clients';
  const isCalendarStaffPage = location.pathname === '/app/calendar-staff' || location.pathname === '/calendar-staff';
  const isServicesPage = location.pathname === '/app/services' || location.pathname === '/services';
  const isCatalogPage = location.pathname === '/app/catalog' || location.pathname === '/catalog';
  const isSuppliersPage = location.pathname === '/app/suppliers' || location.pathname === '/suppliers';
  const isAccountSettingsPage = location.pathname === '/app/account-settings' || location.pathname === '/account-settings';
  const isFinancialManagementPage = location.pathname === '/app/financial-management' || location.pathname === '/financial-management';
  const isCalendarPage = isCalendarClientsPage || isCalendarStaffPage || isServicesPage || isCatalogPage || isSuppliersPage || isAccountSettingsPage || isFinancialManagementPage;
  
  return (
    <div
      className={`flex h-screen ${isCalendarPage ? 'bg-[#ffffff]' : 'bg-gray-50 dark:bg-customBlack'} overflow-x-hidden ${
        isRTL ? 'flex-row-reverse' : ''
      }`}
    >
      {!isMobile && (
  <Sidebar 
    isCollapsed={isDesktopSidebarCollapsed} 
    onCollapse={setIsDesktopSidebarCollapsed}
    isMobile={isMobile}
    isMobileMenuOpen={isMobileMenuOpen}
    setIsMobileMenuOpen={setIsMobileMenuOpen}
    isRTL={isRTL}
  />
)}

      <div
        className={`flex flex-col flex-1 transition-all duration-300 min-w-0 ${
          isMobile
            ? isRTL
              ? 'mr-0'
              : 'ml-0'
            : isDesktopSidebarCollapsed
              ? isRTL
                ? 'lg:mr-16'
                : 'lg:ml-16'
              : isRTL
                ? 'lg:mr-[288px]'
                : 'lg:ml-[288px]'
        }`}
      >
        <Header 
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
          onOpenBusinessProfile={() => setShowBusinessProfile(true)}
        />

        <main
          className={`flex-1 overflow-y-auto p-6 pt-[96px] lg:pt-[88px] ${
            isMobile && !hideBottomNav ? 'pb-24' : ''
          } ${isCalendarPage ? 'bg-[#ffffff]' : ''}`}
        >
          {children}
        </main>

        {/* ✅ BottomNav רק במובייל */}
        {isMobile && !hideBottomNav && <BottomNav basePath={basePath} isRTL={isRTL} />}

        {/* <Footer /> */}
      </div>

      {/* Business Profile Card */}
      <BusinessProfileCard
        isOpen={showBusinessProfile}
        onClose={() => setShowBusinessProfile(false)}
        zIndex={50}
      />
    </div>
  );
};

export default Layout;
