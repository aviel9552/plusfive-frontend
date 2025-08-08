import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonButton, CommonCustomOutlineButton } from '../index';
import { CgCreditCard } from 'react-icons/cg';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';

const SubscriptionDetail = ({ title, value }) => (
  <div>
    <p className="text-xl dark:text-white text-black">{title}</p>
    <p className="mt-1 text-xl dark:text-white text-black font-medium">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-500/20 text-blue-300">
    {status}
  </span>
);

function CurrentActiveSubscription() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getUserCardTranslations(language);

  const handleUpdatePayment = () => {
    navigate('/app/update-payment');
  };

  return (
    <div className="font-ttcommons dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl p-6 dark:text-white dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <h2 className="text-xl font-semibold mb-6">{t.currentActiveSubscription}</h2>

      <div className="md:p-6 rounded-xl md:border dark:border-gray-800 border-gray-200 dark:bg-customBrown bg-customBody">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center pb-6 border-b-0 md:border-b border-gray-200 dark:border-gray-800">
          <SubscriptionDetail title={t.subscription} value="Premium" />
          <SubscriptionDetail title={t.startDate} value="1/15/2025" />
          <SubscriptionDetail title={t.endDate} value="6/15/2025" />
          <div>
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
            className="w-full md:w-auto px-4 py-2 !text-white rounded-lg text-lg"
            onClick={handleUpdatePayment}
          />
          <CommonCustomOutlineButton text={t.cancelSubscription} textColor='text-customRed' className="w-full md:w-auto" />
        </div>
      </div>
    </div>
  );
}

export default CurrentActiveSubscription;
