import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { MdSecurity, MdAdd } from 'react-icons/md';
import { CgCreditCard } from 'react-icons/cg';

const BillingInfoItem = ({ label, value, valueClassName = '' }) => (
    <div className='flex flex-col gap-[4px]'>
        <p className="dark:text-white mb-1 text-16">{label}</p>
        <p className={`font-thin text-14 ${valueClassName}`}>{value}</p>
    </div>
);

function BillingInformation() {
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);
    const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
    
    // Get billing data from payment methods API response
    const getBillingData = () => {
        if (paymentMethodsLoading) {
            return {
                cycle: 'Loading...',
                nextDate: 'Loading...',
                amount: 'Loading...',
                method: 'Loading...'
            };
        }
        
        // Check if we have the new API structure with billing data
        if (paymentMethods?.billing) {
            const billing = paymentMethods.billing;
            
            // Get payment method from payment methods array since billing.payment_method is null
            let method = 'N/A';
            if (paymentMethods?.paymentMethods && Array.isArray(paymentMethods.paymentMethods) && paymentMethods.paymentMethods.length > 0) {
                // Find the default payment method or use the first one
                const defaultMethod = paymentMethods.paymentMethods.find(pm => pm.isDefault) || paymentMethods.paymentMethods[0];
                if (defaultMethod?.card) {
                    method = `${defaultMethod.card.brand_display} **** ${defaultMethod.card.last4}`;
                }
            }
            
            return {
                cycle: billing.current_billing_cycle?.full_range || 'N/A',
                nextDate: billing.next_billing_date || 'N/A',
                amount: billing.amount_to_be_charged?.formatted || 'N/A',
                method: method
            };
        }
        
        // Check if we have payment methods array to get the default one
        if (paymentMethods?.paymentMethods && Array.isArray(paymentMethods.paymentMethods) && paymentMethods.paymentMethods.length > 0) {
            const defaultMethod = paymentMethods.paymentMethods.find(pm => pm.isDefault) || paymentMethods.paymentMethods[0];
            return {
                cycle: 'N/A',
                nextDate: 'N/A',
                amount: 'N/A',
                method: defaultMethod?.card ? `${defaultMethod.card.brand_display} **** ${defaultMethod.card.last4}` : 'N/A'
            };
        }
        
        return {
            cycle: 'N/A',
            nextDate: 'N/A',
            amount: 'N/A',
            method: 'No payment method found'
        };
    };
    
    const billingData = getBillingData();

    return (
        <div className="dark:text-white dark:bg-customBrown bg-white p-[24px] rounded-2xl grid gap-[24px] border border-gray-200 dark:border-customBorderColor mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                       
            {/* Billing Information Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Billing Information
                </h3>
                
                {paymentMethodsLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading billing information...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <BillingInfoItem label={t.currentBillingCycle} value={billingData.cycle} />
                        <BillingInfoItem label={t.nextBillingDate} value={billingData.nextDate} />
                        <BillingInfoItem label={t.amountToBeCharged} value={billingData.amount} valueClassName="font-semibold text-orange-500" />
                        <BillingInfoItem label={t.paymentMethod} value={billingData.method} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default BillingInformation; 