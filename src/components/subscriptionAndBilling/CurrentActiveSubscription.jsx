import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonButton, CommonCustomOutlineButton } from '../index';
import { CgCreditCard } from 'react-icons/cg';

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

  const handleUpdatePayment = () => {
    navigate('/app/update-payment');
  };

  return (
    <div className="font-ttcommons dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl p-6 dark:text-white dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Current Active Subscription</h2>

      <div className="md:p-6 rounded-xl md:border dark:border-gray-800 border-gray-200 dark:bg-customBrown bg-customBody">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center pb-6 border-b-0 md:border-b border-gray-200 dark:border-gray-800">
          <SubscriptionDetail title="Subscription" value="Premium" />
          <SubscriptionDetail title="Start Date" value="1/15/2025" />
          <SubscriptionDetail title="End Date" value="6/15/2025" />
          <div>
            <p className="text-xl dark:text-white text-black">Status</p>
            <div className="mt-1">
              <StatusBadge status="Active" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
          <CommonButton
            text="Update Payment"
            icon={<CgCreditCard className='rotate-180' />}
            className="w-full md:w-auto px-4 py-2 !text-white rounded-lg text-lg"
            onClick={handleUpdatePayment}
          />
          <CommonCustomOutlineButton text="Cancel Subscription" textColor='text-customRed' className="w-full md:w-auto" />
        </div>
      </div>
    </div>
  );
}

export default CurrentActiveSubscription;
