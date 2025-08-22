import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useLanguage } from '../../context/LanguageContext';

const Layout = ({ children }) => {
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { language } = useLanguage();
  const isRTL = language === 'he';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false); // Close mobile menu on resize to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-customBlack overflow-x-hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
      <Sidebar 
        isCollapsed={isDesktopSidebarCollapsed} 
        onCollapse={setIsDesktopSidebarCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isRTL={isRTL}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 min-w-0 ${isMobile ? (isRTL ? 'mr-0' : 'ml-0') : (isDesktopSidebarCollapsed ? (isRTL ? 'lg:mr-16' : 'lg:ml-16') : (isRTL ? 'lg:mr-[288px]' : 'lg:ml-[288px]'))}`}>
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Layout; 