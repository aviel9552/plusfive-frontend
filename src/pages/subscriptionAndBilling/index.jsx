import React from 'react';
import CurrentActiveSubscription from '../../components/subscriptionAndBilling/CurrentActiveSubscription';
import Pricing from '../../components/subscriptionAndBilling/Pricing';
import PaymentHistoryTable from '../../components/subscriptionAndBilling/PaymentHistoryTable';

const SubscriptionAndBilling = () => {
  const slug = window.location.pathname.split('/')[1];
  
  return (
    <div className="space-y-8">
      <CurrentActiveSubscription slug={slug} />
      <Pricing />
      <PaymentHistoryTable />
    </div>
  );
};

export default SubscriptionAndBilling;
