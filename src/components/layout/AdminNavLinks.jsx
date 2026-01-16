import {
  MdQrCode2, MdShare, MdPeople,
  MdCreditCard, MdSettings, MdHelp,
  MdCategory
} from 'react-icons/md';
import { FiBarChart2 } from 'react-icons/fi';
import { IoHomeOutline } from 'react-icons/io5';
import React from 'react';
import { getLayoutTranslations } from '../../utils/translations';
import HomeBlackIcon from '../../assets/home-line-black.svg';
import HomeWhiteIcon from '../../assets/home-line-white.svg';
import QrBlackIcon from '../../assets/qr-code-black.svg';
import QrWhiteIcon from '../../assets/qr-code-white.svg';
import ShareBlackIcon from '../../assets/share-black.svg';
import ShareWhiteIcon from '../../assets/share-white.svg';
import userBlackIcon from '../../assets/users-black.svg';
import userWhiteIcon from '../../assets/users-white.svg';
import AnalyticsBlackIcon from '../../assets/bar-chart-black.svg';
import AnalyticsWhiteIcon from '../../assets/bar-chart-white.svg';
import SubscriptionAndBillingBlackIcon from '../../assets/card-black.svg';
import SubscriptionAndBillingWhiteIcon from '../../assets/card-white.svg';
import AccountSettingsBlackIcon from '../../assets/setting-black.svg';
import AccountSettingsWhiteIcon from '../../assets/setting-white.svg';
import SupportAndHelpBlackIcon from '../../assets/help-black.svg';
import SupportAndHelpWhiteIcon from '../../assets/help-white.svg';

const adminNavLinks = (language = 'en') => {
  const t = getLayoutTranslations(language);
  
  return [
    { 
      to: '/admin/dashboard', 
      icon: IoHomeOutline, 
      label: t.dashboard, 
      specialPaths: ['/','/admin'],
      customIcon: {
        light: HomeBlackIcon,
        dark: HomeWhiteIcon
      }
    },
    // { 
    //   to: '/admin/qr-management', 
    //   icon: MdQrCode2, 
    //   label: t.qrManagement, 
    //   specialPaths: ['/admin/qr-management','/admin/qr-management/my-codes'],
    //   customIcon: {
    //     light: QrBlackIcon,
    //     dark: QrWhiteIcon
    //   }
    // },
    // { 
    //   to: '/admin/referral-management', 
    //   icon: MdShare, 
    //   label: t.referralProgram,
    //   customIcon: {
    //     light: ShareBlackIcon,
    //     dark: ShareWhiteIcon
    //   }
    // },
    { 
      to: '/admin/user-management', 
      icon: MdPeople, 
      label: t.userManagement, 
      specialPaths: ['/admin/user-management/create', '/admin/user-management/edit', '/admin/user-management/edit/:userId', '/admin/user-management/view', '/admin/user-management/view/:userId'],
      customIcon: {
        light: userBlackIcon,
        dark: userWhiteIcon
      }
    },
    { 
      to: '/admin/category', 
      icon: MdCategory, 
      label: t.categoryManagement || 'Category Management'
    },
    // { to: '/admin/customer-management', icon: MdPeople, label: t.customerManagement, specialPaths: ['/admin/customer-management/create', '/admin/customer-management/edit', '/admin/customer-management/edit/:customerId']  },
    { 
      to: '/admin/analytics', 
      icon: FiBarChart2, 
      label: t.analytics,
      customIcon: {
        light: AnalyticsBlackIcon,
        dark: AnalyticsWhiteIcon
      }
    },
    { 
      to: '/admin/subscription-and-billing', 
      icon: MdCreditCard, 
      label: <>
        {t.subscriptionAndBilling}
      </>, 
      specialPaths: ['/admin/update-payment', '/admin/add-card'],
      customIcon: {
        light: SubscriptionAndBillingBlackIcon,
        dark: SubscriptionAndBillingWhiteIcon
      }
    },
    // { 
    //   to: '/admin/account-settings', 
    //   icon: MdSettings, 
    //   label: t.accountSettings,
    //   customIcon: {
    //     light: AccountSettingsBlackIcon,
    //     dark: AccountSettingsWhiteIcon
    //   }
    // },
    // { 
    //   to: '/admin/support-and-help', 
    //   icon: MdHelp, 
    //   label: <>
    //     {t.supportAndHelp}
    //   </>,
    //   customIcon: {
    //     light: SupportAndHelpBlackIcon,
    //     dark: SupportAndHelpWhiteIcon
    //   }
    // },
  ];
};

  // Special page titles for specific URLs
  const specialPageTitles = (language = 'en') => {
    const t = getLayoutTranslations(language);
  
  return {
    // '/admin/qr-management': t.qrManagement,
    // '/admin/qr-management/my-codes': t.myQRCodes,
    '/admin/user-management/create': t.createUser,
    '/admin/user-management/edit': t.editUser,
    '/admin/user-management/edit/:userId': t.editUser,
    '/admin/user-management/view': t.viewUser,
    '/admin/user-management/view/:userId': t.viewUser,
    // '/admin/customer-management': t.customerManagement,
    // '/admin/customer-management/create': t.createUser,
    // '/admin/customer-management/edit': t.editUser,
    // '/admin/customer-management/edit/:userId': t.editUser,
    '/admin/update-payment': t.updatePayment,
    '/admin/add-card': t.addNewCard,
    '/admin/new-feature': t.newFeature,
    '/admin/settings': t.settings 
  };
};

export { adminNavLinks, specialPageTitles };
export default adminNavLinks;
