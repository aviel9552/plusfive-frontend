import React from 'react';

const BillingInfoItem = ({ label, value, valueClassName = '' }) => (
    <div>
        <p className="dark:text-white mb-1 text-xl">{label}</p>
        <p className={`font-thin text-lg ${valueClassName}`}>{value}</p>
    </div>
);

function BillingInformation() {
    const billingData = {
        cycle: 'May 15 - June 15, 2025',
        nextDate: 'June 15, 2025',
        amount: '$29',
        method: 'Visa **** 4242'
    };

    return (
        <div className="dark:text-white dark:bg-customBrown bg-white p-8 rounded-2xl border border-gray-200 dark:border-customBorderColor mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <h2 className="text-2xl font-bold mb-8">Billing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BillingInfoItem label="Current Billing Cycle" value={billingData.cycle} />
                <BillingInfoItem label="Next Billing Date" value={billingData.nextDate} />
                <BillingInfoItem label="Amount to be Charged" value={billingData.amount} valueClassName="font-semibold text-customRed" />
                <BillingInfoItem label="Payment Method" value={billingData.method} />
            </div>
        </div>
    );
}

export default BillingInformation; 