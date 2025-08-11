// src/components/layout/UserNavLinks.js
import {
    MdQrCode2, MdShare, MdPeople, MdAnalytics,
    MdCreditCard, MdSettings, MdHelp
  } from 'react-icons/md';
  import { IoHomeOutline } from 'react-icons/io5';
  import React from 'react';
  import { getLayoutTranslations } from '../../utils/translations';
  
  const userNavLinks = (language = 'en') => {
  const t = getLayoutTranslations(language);
    
    return [
      { to: '/app/dashboard', icon: IoHomeOutline, label: t.dashboard, specialPaths: ['/','/app'] },
      { to: '/app/qr-management/my-codes', icon: MdQrCode2, label: t.qrManagement, specialPaths: ['/app/qr-management'] },
      { to: '/app/referral', icon: MdShare, label: t.referralProgram },
      { to: '/app/customers', icon: MdPeople, label: t.customerManagement },
      { to: '/app/analytics', icon: MdAnalytics, label: t.analytics },
      { to: '/app/subscription-and-billing', icon: MdCreditCard, label: <>{t.subscriptionAndBilling}</>, specialPaths: ['/app/update-payment', '/app/add-card'] },
      { to: '/app/account-settings', icon: MdSettings, label: t.accountSettings },
      { to: '/app/support-and-help', icon: MdHelp, label: <>{t.supportAndHelp}</> },
    ];
  };

  // Special page titles for specific URLs
  const specialPageTitles = (language = 'en') => {
    const t = getLayoutTranslations(language);
    
    return {
      '/app/qr-management': t.qrManagement,
      '/app/update-payment': t.updatePayment,
      '/app/add-card': t.addNewCard
    };
  };

  export { userNavLinks, specialPageTitles };
  
  export default userNavLinks;