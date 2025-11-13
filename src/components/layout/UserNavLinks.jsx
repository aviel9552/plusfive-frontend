// src/components/layout/UserNavLinks.js
import {
    MdQrCode2, MdShare, MdPeople, MdAnalytics,
    MdCreditCard, MdSettings, MdHelp
  } from 'react-icons/md';
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
  
  const userNavLinks = (language = 'en') => {
  const t = getLayoutTranslations(language);
    
    return [
      { 
        to: '/app/dashboard', 
        icon: IoHomeOutline, 
        label: t.dashboard, 
        specialPaths: ['/','/app'],
        customIcon: {
          light: HomeBlackIcon,
          dark: HomeWhiteIcon
        }
      },
      { 
        to: '/app/qr-management', 
        icon: MdQrCode2, 
        label: t.qrManagement, 
        specialPaths: ['/app/qr-management','/app/qr-management/my-codes'],
        customIcon: {
          light: QrBlackIcon,
          dark: QrWhiteIcon
        }
      },
      // { 
      //   to: '/app/referral', 
      //   icon: MdShare, 
      //   label: t.referralProgram,
      //   customIcon: {
      //     light: ShareBlackIcon,
      //     dark: ShareWhiteIcon
      //   }
      // },
      { 
        to: '/app/customers', 
        icon: MdPeople, 
        label: t.customerManagement, 
        specialPaths: ['/app/customers/view', '/app/customers/view/:customerId'],
        customIcon: {
          light: userBlackIcon,
          dark: userWhiteIcon
        }
      },
      { 
        to: '/app/analytics', 
        icon: MdAnalytics, 
        label: t.analytics,
        customIcon: {
          light: AnalyticsBlackIcon,
          dark: AnalyticsWhiteIcon
        }
      },
      { 
        to: '/app/subscription-and-billing', 
        icon: MdCreditCard, 
        label: <>{t.subscriptionAndBilling}</>, 
        specialPaths: ['/app/update-payment', '/app/add-card'],
        customIcon: {
          light: SubscriptionAndBillingBlackIcon,
          dark: SubscriptionAndBillingWhiteIcon
        }
      },
      // { 
      //   to: '/app/account-settings', 
      //   icon: MdSettings, 
      //   label: t.accountSettings,
      //   customIcon: {
      //     light: AccountSettingsBlackIcon,
      //     dark: AccountSettingsWhiteIcon
      //   }
      // },
      // { 
      //   to: '/app/support-and-help', 
      //   icon: MdHelp, 
      //   label: <>{t.supportAndHelp}</>,
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
      // '/app/customers': t.customerManagement,
      // '/app/customers/create': t.createUser,
      '/app/customers/view': t.customerDetails,
      '/app/customers/view/:customerId': t.customerDetails,
      '/app/qr-management': t.qrManagement,
      '/app/update-payment': t.updatePayment,
      '/app/add-card': t.addNewCard
    };
  };

  export { userNavLinks, specialPageTitles };
  
  export default userNavLinks;