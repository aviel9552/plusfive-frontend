import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { MdAutoAwesome } from 'react-icons/md';
import { CommonButton, CommonOutlineButton } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import StripeTest from './StripeTest';
import AuthDebugger from './AuthDebugger';
import CheckIcon from '../../assets/CheckIcon.svg';

// Helper function to format Stripe price data into plan objects
const formatStripePricesToPlans = (stripePrices, t, isYearly) => {
    
    if (!Array.isArray(stripePrices) || stripePrices.length === 0) {
        return [];
    }

    const formattedPlans = stripePrices.map(price => {
        
        const amount = price.unit_amount / 100; // Convert from cents
        const interval = price.recurring?.interval; // monthly or yearly
        
        // Only show plans that match the current billing interval
        if (interval !== (isYearly ? 'year' : 'month')) {
            return null;
        }

        const plan = {
            name: price.product?.name || price.metadata?.planName || price.nickname || 'Premium Plan',
            description: price.product?.description || price.metadata?.description || t.premiumDescription,
            monthlyPrice: interval === 'month' ? amount : null,
            yearlyPrice: interval === 'year' ? amount : null,
            features: price.product?.marketing_features ? 
                price.product.marketing_features.map(feature => feature.name) : 
                [t.basicReports, t.emailSupport],
            isPopular: price.metadata?.isPopular === 'true',
            stripePriceId: price.id,
            priceId: price.id
        };
        
        return plan;
    }).filter(Boolean); // Remove null values
    
    // Sort plans by price from lowest to highest
    const sortedPlans = formattedPlans.sort((a, b) => {
        const priceA = isYearly ? a.yearlyPrice : a.monthlyPrice;
        const priceB = isYearly ? b.yearlyPrice : b.monthlyPrice;
        return priceA - priceB;
    });
    
    return sortedPlans;
};

// Toggle Switch Component
const BillingToggle = ({ isYearly, onToggle, t, language }) => (
    <div className="flex items-center md:justify-center justify-between gap-3 md:mt-0 mt-5">
        <div className='flex items-center justify-center gap-2'>
            <span className={`font-medium transition-colors text-14 ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.payMonthly}</span>
            <button
                onClick={onToggle}
                className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors focus:outline-none ${isYearly ? 'dark:bg-[#675DFF]' : 'bg-gray-700'}`}
            >
                <span className={` ${language === 'he' ? 'block' : 'hidden'}`}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${isYearly ? 'translate-x-6 bg-indigo-500' : 'translate-x-1'}`} />
            </button>
        </div>

        <div className='flex items-center justify-center gap-2'>
            <span className={`font-medium transition-colors text-14 ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.payYearly}</span>
            <span className="bg-[#D3D9FF] text-[#271DBF] text-14 font-semibold   p-1 rounded-md">
                15% {t.off}
            </span>
        </div>
    </div>
);

// Pricing Card Component
const PricingCard = ({ plan, isYearly, t, onSubscribe, loading, currentSubscription, onManageSubscription }) => {
    const { name, description, monthlyPrice, yearlyPrice, features, isPopular, priceId, stripePriceId } = plan;
    const price = isYearly ? yearlyPrice : monthlyPrice;
    
    // Don't render if no price is available for the current billing interval
    if (price === null || price === undefined) {
        return null;
    }
    
    const isCurrentPlan = currentSubscription?.priceId === stripePriceId;
    const isSubscribed = !!currentSubscription;

    const cardClasses = `
    bg-customGray2 dark:bg-customGray p-[24px] rounded-2xl flex flex-col h-full
    ${isPopular ? 'relative' : ''}
  `;

    const popularBadge = isPopular ? (
        <div className="absolute top-6 right-6 bg-gray-100 dark:bg-customWhite backdrop-blur-sm text-sm font-semibold px-3 p-1 rounded-full flex items-center gap-[6px]">
            <MdAutoAwesome className="text-purple-500 dark:text-purple-400 text-16" />
            <span className="font-bold bg-gradient-to-br from-[#FF2380] to-[#675DFF] text-transparent bg-clip-text text-14">
                {t.popular}
            </span>
        </div>
    ) : null;

    const cardWrapperClass = isPopular ? 'p-[2px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl' : 'border-2 border-gray-300 dark:border-customBorderColor rounded-2xl';

    const handleAction = () => {
        if (isCurrentPlan) {
            onManageSubscription();
        } else if (stripePriceId) {
            onSubscribe(stripePriceId, name);
        }
    };

    const getButtonText = () => {
        if (isCurrentPlan) {
            return currentSubscription?.status === 'active' ? 'Manage Subscription' : 'Reactivate';
        }
        return `Upgrade to ${name}`;
    };

    const getButtonProps = () => {
        if (isCurrentPlan) {
            return {
                text: getButtonText(),
                className: "w-full !py-3 !text-16 rounded-[8px]",
                onClick: handleAction,
                disabled: loading
            };
        }
        
        return {
            text: getButtonText(),
            className: "w-full !py-3 !text-16 rounded-[8px]",
            onClick: handleAction,
            disabled: loading || !stripePriceId
        };
    };

    return (
        <div className={cardWrapperClass}>
            <div className={cardClasses}>
                {popularBadge}
                <div className='flex flex-col gap-[12px]'>
                    <h3 className="text-24 font-semibold text-gray-900 dark:text-white">{name}</h3>
                    <p className="text-gray-500 dark:text-white text-16">{description}</p>
                </div>

                <div className="mt-8">
                    <span className="text-36 font-bold text-gray-900 dark:text-white font-ttcommons">${price}</span>
                    <span className="text-gray-500 dark:text-white text-24 font-ttcommons">
                        {isYearly ? t.perYear || '/year' : t.perMonth}
                    </span>
                </div>

                <div className="border-t border-gray-300 dark:border-[#FFFFFF1A] my-8"></div>

                <ul className="space-y-4 mb-10 flex-grow">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <img src={CheckIcon} alt="check" className="text-white text-xl" />
                            <span className="text-gray-600 dark:text-white text-16">{feature}</span>
                        </li>
                    ))}
                </ul>

                {isPopular ? (
                    <CommonButton
                        {...getButtonProps()}
                    />
                ) : (
                    <CommonOutlineButton
                        {...getButtonProps()}
                        lightBgColor="#E9E9E9"
                        darkBgColor="#1D1C20"
                    />
                )}
            </div>
        </div>
    );
};

function Pricing() {
    const [isYearly, setIsYearly] = useState(false); // Default to monthly since all plans are monthly
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);
    
         // Stripe subscription hook
     const {
         prices,
         currentSubscription,
         loading,
         pricesLoading,
         subscriptionLoading,
         isAuthenticated,
         user,
         handleSubscribe,
         handleCancelSubscription,
         handleReactivateSubscription,
         handleOpenCustomerPortal
     } = useStripeSubscription();

    const handleToggle = () => {
        setIsYearly(prev => !prev);
    };

    // Get pricing plans from Stripe API only
    const getPricingPlans = () => {
        const plans = formatStripePricesToPlans(prices, t, isYearly);
        return plans;
    };

    const pricingPlans = getPricingPlans();
    

    const handlePlanSubscribe = (priceId, planName) => {
        if (!isAuthenticated) {
            // You can redirect to login or show login modal here
            return;
        }
        handleSubscribe(priceId, planName);
    };

    const handleManageSubscription = () => {
        if (currentSubscription?.status === 'active') {
            handleOpenCustomerPortal();
        } else if (currentSubscription?.status === 'canceled') {
            handleReactivateSubscription();
        }
    };

    return (
        <div className="bg-white dark:bg-customBrown text-gray-900 dark:text-white font-ttcommons p-6 border border-gray-200 dark:border-customBorderColor rounded-2xl mt-7 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                         <div className="md:flex justify-between items-center gap-6">
                 <h1 className="text-24 font-ttcommons font-bold">{t.pricing}</h1>
                 <BillingToggle isYearly={isYearly} onToggle={handleToggle} t={t} language={language} />
             </div>
             
             {/* Authentication Status */}
             {/* <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <span className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                         <span className="text-sm text-gray-600 dark:text-gray-400">
                             {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                         </span>
                     </div>
                     {isAuthenticated && user && (
                         <span className="text-xs text-gray-500 dark:text-gray-400">
                             Logged in as: {user.email} ({user.role})
                         </span>
                     )}
                 </div>
             </div> */}

            {/* Current Subscription Status */}
            {/* {currentSubscription && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                Current Plan: {currentSubscription.planName || 'Active Subscription'}
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Status: {currentSubscription.status} • 
                                Next billing: {currentSubscription.currentPeriodEnd ? 
                                    new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <CommonButton
                            text="Manage Subscription"
                            onClick={handleOpenCustomerPortal}
                            className="!py-2 !px-4"
                        />
                    </div>
                </div>
            )} */}

            {/* Pricing Plans Grid */}
            {pricingPlans.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-7 items-stretch">
                    {pricingPlans.map(plan => (
                        <PricingCard 
                            key={plan.name} 
                            plan={plan} 
                            isYearly={isYearly} 
                            t={t}
                            onSubscribe={handlePlanSubscribe}
                            loading={loading}
                            currentSubscription={currentSubscription}
                            onManageSubscription={handleManageSubscription}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-7 text-center">
                    {pricesLoading ? (
                        <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">Loading pricing plans...</span>
                        </div>
                    ) : (
                        <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No Pricing Plans Available
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {Array.isArray(prices) && prices.length === 0 
                                    ? 'No pricing plans have been configured yet.'
                                    : 'Unable to load pricing plans. Please try again later.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
            
                         {/* Stripe Integration Test - Remove this in production */}
             {/* <div className="mt-8">
                 <StripeTest />
             </div>
              */}
             {/* Authentication Debugger - Remove this in production */}
             {/* <div className="mt-8">
                 <AuthDebugger />
             </div> */}
            
            {/* API Configuration Notice */}
            {pricesLoading === false && (!Array.isArray(prices) || prices.length === 0) && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 text-xs font-bold">i</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                                API-Only Pricing Configuration
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                This pricing page only displays plans from the Stripe API. No default plans are shown. 
                                Please ensure your backend has pricing plans configured in Stripe to display them here.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="max-w-6xl mx-auto">
            </div>
        </div>
    );
}

export default Pricing;
