import {
  MdQrCode2, MdShare, MdPeople, MdAnalytics,
  MdCreditCard, MdSettings, MdHelp
} from 'react-icons/md';
import { IoHomeOutline } from 'react-icons/io5';
import React from 'react';
import { getLayoutTranslations } from '../../utils/translations';

const adminNavLinks = (language = 'en') => {
  const t = getLayoutTranslations(language);
  
  return [
    { to: '/admin/dashboard', icon: IoHomeOutline, label: t.dashboard, specialPaths: ['/','/admin'] },
    { to: '/admin/qr-management/listing', icon: MdQrCode2, label: t.qrManagement, specialPaths: ['/admin/qr-management','/admin/qr-management/my-codes'] },
    { to: '/admin/referral-management', icon: MdShare, label: t.referralProgram },
    { to: '/admin/user-management', icon: MdPeople, label: t.userManagement, specialPaths: ['/admin/user-management/create', '/admin/user-management/edit', '/admin/user-management/edit/:userId']  },
    { to: '/admin/customer-management', icon: MdPeople, label: t.customerManagement, specialPaths: ['/admin/customer-management/create', '/admin/customer-management/edit', '/admin/customer-management/edit/:userId']  },
    { to: '/admin/analytics', icon: MdAnalytics, label: t.analytics },
    { to: '/admin/subscription-and-billing', icon: MdCreditCard, label: <>
      {t.subscriptionAndBilling}
    </>, specialPaths: ['/admin/update-payment', '/admin/add-card'] },
    { to: '/admin/account-settings', icon: MdSettings, label: t.accountSettings },
    { to: '/admin/support-and-help', icon: MdHelp, label: <>
      {t.supportAndHelp}
    </> },
  ];
};

  // Special page titles for specific URLs
  const specialPageTitles = (language = 'en') => {
    const t = getLayoutTranslations(language);
  
  return {
    '/admin/qr-management': t.qrManagement,
    '/admin/qr-management/my-codes': t.myQRCodes,
    '/admin/user-management/create': t.createUser,
    '/admin/user-management/edit': t.editUser,
    '/admin/user-management/edit/:userId': t.editUser,
    '/admin/customer-management': t.customerManagement,
    '/admin/customer-management/create': t.createUser,
    '/admin/customer-management/edit': t.editUser,
    '/admin/customer-management/edit/:userId': t.editUser,
    '/admin/update-payment': t.updatePayment,
    '/admin/add-card': t.addNewCard,
    '/admin/new-feature': t.newFeature,
    '/admin/settings': t.settings 
  };
};

export { adminNavLinks, specialPageTitles };
export default adminNavLinks;
