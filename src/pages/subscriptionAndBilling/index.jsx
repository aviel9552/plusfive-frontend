import React from 'react';
import CurrentActiveSubscription from '../../components/subscriptionAndBilling/CurrentActiveSubscription';
import Pricing from '../../components/subscriptionAndBilling/Pricing';
import PaymentHistoryTable from '../../components/subscriptionAndBilling/PaymentHistoryTable';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';

const SubscriptionAndBilling = () => {
  const slug = window.location.pathname.split('/')[1];
  
  // Get subscription loading state to control Pricing component visibility
  const { subscriptionLoading } = useStripeSubscription(slug);
  
  return (
    <div className="space-y-8">
      <CurrentActiveSubscription slug={slug} />
      {/* Show Pricing only after CurrentActiveSubscription loading is complete */}
      <Pricing slug={slug} subscriptionLoading={subscriptionLoading} />
      {/* {!subscriptionLoading && <Pricing slug={slug} />} */}
      <PaymentHistoryTable />
    </div>
  );
};

export default SubscriptionAndBilling;
