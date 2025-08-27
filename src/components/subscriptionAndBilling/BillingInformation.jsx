import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import { format, addDays, addMonths, addYears } from 'date-fns';

const BillingInfoItem = ({ label, value, valueClassName = '' }) => (
    <div className='flex flex-col gap-[4px]'>
        <p className="dark:text-white mb-1 text-16">{label}</p>
        <p className={`font-thin text-14 ${valueClassName}`}>{value}</p>
    </div>
);

function BillingInformation() {
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);
    const { currentSubscription, loading } = useStripeSubscription();
    
    // Helper function to format billing cycle dates
    const formatBillingCycle = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
        } catch (error) {
            return 'Invalid date';
        }
    };
    
    // Helper function to format next billing date
    const formatNextBillingDate = (currentPeriodEnd) => {
        if (!currentPeriodEnd) return 'N/A';
        try {
            const nextDate = new Date(currentPeriodEnd);
            return format(nextDate, 'MMM d, yyyy');
        } catch (error) {
            return 'Invalid date';
        }
    };
    
    // Get live billing data from subscription
    const getBillingData = () => {
        if (loading) {
            return {
                cycle: 'Loading...',
                nextDate: 'Loading...',
                amount: 'Loading...',
                method: 'N/A'
            };
        }
        
        // Check if we have subscriptions array
        const subscriptions = currentSubscription?.data?.stripe?.subscriptions;
        if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
            return {
                cycle: 'No active subscription',
                nextDate: 'N/A',
                amount: 'N/A',
                method: 'N/A'
            };
        }
        
        // Get the most recent active subscription (first one in the array)
        const subscription = subscriptions[0];
        
        // Get price info from subscription items
        const subscriptionItem = subscription.items?.data?.[0];
        const price = subscriptionItem?.price;
        
        // Calculate billing cycle dates (convert Unix timestamp to milliseconds)
        const startDate = subscription.current_period_start * 1000;
        const endDate = subscription.current_period_end * 1000;
        const nextBillingDate = subscription.current_period_end * 1000;
        
        // Format amount based on price data
        let amount = 'N/A';
        if (price?.unit_amount) {
            const amountInCents = price.unit_amount;
            const amountInDollars = (amountInCents / 100).toFixed(2);
            amount = `$${amountInDollars}`;
            
            // Add billing interval if available
            if (price.recurring?.interval) {
                const interval = price.recurring.interval;
                if (price.recurring.interval_count > 1) {
                    amount += ` every ${price.recurring.interval_count} ${interval}s`;
                } else {
                    amount += ` per ${interval}`;
                }
            }
        }
        
        // Get payment method info (might be null in this API structure)
        let method = 'N/A';
        // Note: default_payment_method is null in the current API response
        // You might need to fetch this separately or it might be in a different field
        
        return {
            cycle: formatBillingCycle(startDate, endDate),
            nextDate: formatNextBillingDate(nextBillingDate),
            amount: amount,
            method: method
        };
    };
    
    const billingData = getBillingData();

    return (
        <div className="dark:text-white dark:bg-customBrown bg-white p-[24px] rounded-2xl grid gap-[24px] border border-gray-200 dark:border-customBorderColor mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="text-24 font-ttcommons font-bold">{t.billingInformation}</h2>
                
                {/* Subscription Status Indicator
                {!loading && currentSubscription?.data?.stripe?.subscriptions?.[0] && (
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                            currentSubscription.data.stripe.subscriptions[0].status === 'active' 
                                ? 'bg-green-500' 
                                : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm font-medium capitalize">
                            {currentSubscription.data.stripe.subscriptions[0].status}
                        </span>
                    </div>
                )} */}
            </div>
            
            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading billing information...</span>
                </div>
            )}
            
            {/* Billing Data Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-8">
                    <BillingInfoItem label={t.currentBillingCycle} value={billingData.cycle} />
                    <BillingInfoItem label={t.nextBillingDate} value={billingData.nextDate} />
                    <BillingInfoItem label={t.amountToBeCharged} value={billingData.amount} valueClassName="font-semibold text-customRed" />
                    <BillingInfoItem label={t.paymentMethod} value={billingData.method} />
                    
                    {/* Additional Billing Info */}
                    {/* {currentSubscription?.data?.stripe?.subscriptions?.[0] && (
                        <>
                            <BillingInfoItem 
                                label="Subscription ID" 
                                value={currentSubscription.data.stripe.subscriptions[0].id || 'N/A'} 
                                valueClassName="text-xs font-mono"
                            />
                            <BillingInfoItem 
                                label="Plan Name" 
                                value={currentSubscription.data.stripe.subscriptions[0].items?.data?.[0]?.price?.product || 'N/A'} 
                            />
                        </>
                    )} */}
                </div>
            )}
            
            {/* Multiple Subscriptions Notice */}
            {/* {!loading && currentSubscription?.data?.stripe?.subscriptions && 
                currentSubscription.data.stripe.subscriptions.length > 1 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                                {currentSubscription.data.stripe.subscriptions.length}
                            </span>
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                            <p className="font-medium">
                                You have {currentSubscription.data.stripe.subscriptions.length} active subscriptions
                            </p>
                            <p className="text-xs mt-1">
                                Showing details for the most recent one. Contact support for detailed information about all subscriptions.
                            </p>
                        </div>
                    </div>
                </div>
            )} */}
            
            {/* No Subscription Message */}
            {/* {!loading && (!currentSubscription?.data?.stripe?.subscriptions || 
                !Array.isArray(currentSubscription.data.stripe.subscriptions) || 
                currentSubscription.data.stripe.subscriptions.length === 0) && (
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        No active subscription found
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Subscribe to a plan to see billing information here
                    </p>
                </div>
            )} */}
            
            {/* Debug Information (Development Only) */}
            {/* {process.env.NODE_ENV === 'development' && !loading && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Debug: Subscription Data
                        </summary>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                            {JSON.stringify(currentSubscription, null, 2)}
                        </pre>
                    </details>
                </div>
            )} */}
        </div>
    );
}

export default BillingInformation; 