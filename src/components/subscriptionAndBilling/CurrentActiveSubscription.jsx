import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonButton, CommonCustomOutlineButton } from '../index';
import { CgCreditCard } from 'react-icons/cg';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';

const SubscriptionDetail = ({ title, value }) => (
  <div className='flex flex-col gap-[16px]'>
    <p className="text-18 dark:text-white text-black">{title}</p>
    <p className="mt-1 text-16 dark:text-white text-black ">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="px-3 p-1 text-16 font-medium rounded-full bg-[#D0E2FF] text-[#2537A5]">
    {status}
  </span>
);

function CurrentActiveSubscription({ slug }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getUserCardTranslations(language);

  const handleUpdatePayment = () => {
    navigate(`/${slug}/update-payment`);
  };

  return (
    <div className="font-ttcommons dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl p-[24px] dark:text-white dark:hover:bg-customBlack shadow-md hover:shadow-sm">

      <div className='flex flex-col gap-[24px]'>

        <h2 className="text-20 font-semibold ">{t.currentActiveSubscription}</h2>

        <div className="md:p-[24px] rounded-xl md:border dark:border-gray-800 border-gray-200 dark:bg-customBrown bg-customBody">
          <div className="flex justify-between pb-6 border-b-0 md:border-b border-gray-200 dark:border-gray-800">
            <SubscriptionDetail title={t.subscription} value="Premium" />
            <SubscriptionDetail title={t.startDate} value="1/15/2025" />
            <SubscriptionDetail title={t.endDate} value="6/15/2025" />
            <div className='flex flex-col gap-[16px]'>
              <p className="text-xl dark:text-white text-black">{t.status}</p>
              <div className="mt-1">
                <StatusBadge status={t.active} />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
            <CommonButton
              text={t.updatePayment}
              icon={<CgCreditCard className='rotate-180' />}
              className="w-full md:w-auto px-4 py-2 !text-white rounded-lg text-14"
              onClick={handleUpdatePayment}
            />
            <CommonCustomOutlineButton text={t.cancelSubscription} textColor='text-customRed' className="w-full md:w-auto text-14" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default CurrentActiveSubscription;
