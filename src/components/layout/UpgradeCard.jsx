import React from 'react';
import { MdStars, MdClose } from 'react-icons/md';
import { CommonButton } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getLayoutTranslations } from '../../utils/translations';

const UpgradeCard = ({ onClose }) => {
  const { language } = useLanguage();
  const t = getLayoutTranslations(language);

  return (
    <div className="bg-gray-100 dark:bg-customBrown border border-gray-200 dark:border-commonBorder p-[16px] rounded-[8px]">
      <div className="flex items-center mb-2 justify-between">
        <div className="mr-2 bg-white p-[10px] rounded-lg border-2 border-gray-200 dark:border-commonBorder">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.50033 14.5833H2.91699M5.41699 10H1.66699M7.50033 5.41667H3.33366M14.167 2.5L8.66996 10.1958C8.42666 10.5365 8.30501 10.7068 8.31027 10.8488C8.31486 10.9724 8.37414 11.0876 8.47207 11.1632C8.58456 11.25 8.79386 11.25 9.21245 11.25H13.3337L12.5003 17.5L17.9974 9.80416C18.2407 9.46353 18.3623 9.29322 18.357 9.15123C18.3525 9.0276 18.2932 8.9124 18.1952 8.83682C18.0828 8.75 17.8735 8.75 17.4549 8.75H13.3337L14.167 2.5Z" stroke="#675DFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <button
          className=" text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white"
          onClick={onClose}
          aria-label="Close upgrade card"
        >
          <MdClose className="text-20" />
        </button>
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white text-18">{t.upgradePlan}</span>
          <span className="text-12 border border-[#ffffff33] bg-gray-50 dark:bg-[#ffffff1a] text-gray-700 dark:text-white px-[6px] py-[2px] rounded">{t.twentyPercentOff}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-white mt-1">{t.unlockFullAccess}</p>
      </div>
      <CommonButton
        text={t.upgradeNow}
        className="w-full rounded-[8px] px-[16px] py-[8px] text-14"
      />
    </div>
  );
};

export default UpgradeCard; 