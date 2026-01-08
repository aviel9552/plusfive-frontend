// src/components/layout/UserNavLinks.js
import {
    MdQrCode2, MdShare, MdPeople,
    MdCreditCard, MdSettings, MdHelp
  } from 'react-icons/md';
import { FiBarChart2, FiHome, FiCalendar, FiUsers, FiPackage, FiDollarSign } from 'react-icons/fi';
import { LuHandshake } from 'react-icons/lu';
import { FiSmile } from 'react-icons/fi';
  import React from 'react';
  import { getLayoutTranslations } from '../../utils/translations';
  
  const userNavLinks = (language = 'en') => {
  const t = getLayoutTranslations(language);
    
    return [
      { 
        to: '/app/dashboard', 
        icon: FiHome, 
        label: language === 'he' ? 'דף הבית' : 'Home', 
        specialPaths: ['/','/app']
      },
      { 
        to: '/app/calendar', 
        icon: FiCalendar, 
        label: language === 'he' ? 'יומן' : 'Calendar'
      },
      { 
        to: '/app/calendar-clients', 
        icon: FiSmile, 
        label: language === 'he' ? 'לקוחות' : 'Customers',
        specialPaths: ['/app/customers', '/app/customers/view', '/app/customers/view/:customerId']
      },
      { 
        to: '/app/calendar-staff', 
        icon: FiUsers, 
        label: language === 'he' ? 'אנשי צוות' : 'Staff'
      },
      { 
        to: '/app/suppliers', 
        icon: FiPackage, 
        label: language === 'he' ? 'ספקים' : 'Suppliers'
      },
      { 
        to: '/app/services', 
        icon: LuHandshake, 
        label: language === 'he' ? 'שירותים' : 'Services'
      },
      { 
        to: '/app/catalog', 
        icon: FiPackage, 
        label: language === 'he' ? 'מוצרים' : 'Products'
      },
      { 
        to: '/app/analytics', 
        icon: FiBarChart2, 
        label: language === 'he' ? 'סטטיסטיקות' : 'Statistics'
      },
      { 
        to: '/app/financial-management', 
        icon: FiDollarSign, 
        label: language === 'he' ? 'ניהול פיננסי' : 'Financial Management'
      },
      { 
        to: '/app/customers', 
        icon: MdPeople, 
        label: language === 'he' ? 'ניהול לקוחות' : 'Customer Management', 
        specialPaths: ['/app/customers/view', '/app/customers/view/:customerId']
      },
      { 
        to: '/app/subscription-and-billing', 
        icon: MdCreditCard, 
        label: language === 'he' ? 'מנוי וחשבונות' : 'Subscription and Billing', 
        specialPaths: ['/app/update-payment', '/app/add-card']
      },
    ];
  };

  // Special page titles for specific URLs
  const specialPageTitles = (language = 'en') => {
    const t = getLayoutTranslations(language);
    
    return {
      // '/app/customers': t.customerManagement,
      // '/app/customers/create': t.createUser,
      '/app/customers/view': t.customerDetails,
      '/app/customers/view/:customerId': t.customerDetails,
      // '/app/qr-management': t.qrManagement,
      '/app/update-payment': t.updatePayment,
      '/app/add-card': t.addNewCard
    };
  };

  export { userNavLinks, specialPageTitles };
  
  export default userNavLinks;