import React, { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { MdAutoAwesome } from 'react-icons/md';
import { CommonButton, CommonOutlineButton } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import StripeTest from './StripeTest';
import AuthDebugger from './AuthDebugger';
import CheckIcon from '../../assets/CheckIcon.svg';
import { getAllWhatsAppMessagesData } from '../../redux/services/whatsAppMessagesData';

// Helper function to format Stripe price data into plan objects
const formatStripePricesToPlans = (stripePrices, t, isYearly) => {
    if (!Array.isArray(stripePrices) || stripePrices.length === 0) {
        return [];
    }

    // Group prices by product to handle monthly/yearly variants
    const productGroups = {};
    
    stripePrices.forEach(price => {
        const productId = price.product?.id || price.product;
        const planName = price.product?.name || price.metadata?.planName || price.nickname || 'Premium Plan';
        
        if (!productGroups[productId]) {
            productGroups[productId] = {
                productId,
                planName,
                description: price.product?.description || price.metadata?.description || t.premiumDescription,
                features: price.product?.marketing_features ?
                    price.product.marketing_features.map(feature => feature.name) :
                    [t.basicReports, t.emailSupport],
                isPopular: planName.toLowerCase().includes('premium') || price.metadata?.isPopular === 'true',
                monthlyPrice: null,
                yearlyPrice: null,
                monthlyPriceId: null,
                yearlyPriceId: null,
                currency: price.currency || 'usd',
                isMetered: false,
                meterId: null,
                isDaily: false
            };
        }
        
        const interval = price.recurring?.interval;
        const amount = price.unit_amount / 100;
        const usageType = price.recurring?.usage_type;
        const meterId = price.recurring?.meter;
        
        if (interval === 'month') {
            productGroups[productId].monthlyPrice = amount;
            productGroups[productId].monthlyPriceId = price.id;
        } else if (interval === 'year') {
            productGroups[productId].yearlyPrice = amount;
            productGroups[productId].yearlyPriceId = price.id;
        } else if (interval === 'day') {
            // For daily plans, treat them as monthly plans for display purposes
            productGroups[productId].monthlyPrice = amount;
            productGroups[productId].monthlyPriceId = price.id;
            productGroups[productId].isDaily = true;
        }
        
        // Set metered info from any price
        if (usageType === 'metered' || !!meterId) {
            productGroups[productId].isMetered = true;
            productGroups[productId].meterId = meterId;
        }
    });

    // Convert grouped data to plan objects
    const formattedPlans = Object.values(productGroups).map(group => {
        const currentPrice = isYearly ? group.yearlyPrice : group.monthlyPrice;
        const currentPriceId = isYearly ? group.yearlyPriceId : group.monthlyPriceId;
        
        // Only include plans that have a price for the current interval
        if (currentPrice === null || currentPrice === undefined) {
            return null;
        }

        return {
            name: group.planName,
            description: group.description,
            monthlyPrice: group.monthlyPrice,
            yearlyPrice: group.yearlyPrice,
            features: group.features,
            isPopular: group.isPopular,
            stripePriceId: currentPriceId,
            priceId: currentPriceId,
            isMetered: group.isMetered,
            meterId: group.meterId,
            currency: group.currency,
            isDaily: group.isDaily,
            // Add unique key for React
            uniqueKey: `${group.productId}-${isYearly ? 'yearly' : 'monthly'}`
        };
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
                <span className={` ${language === 'he' ? 'block' : 'hidden'}`}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
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
    const { language } = useLanguage(); // Add language hook
    const { name, description, monthlyPrice, yearlyPrice, features, isPopular, priceId, stripePriceId, isMetered, currency, meterId, isDaily } = plan;
    const price = isYearly ? yearlyPrice : monthlyPrice;

    // Don't render if no price is available for the current billing interval
    if (price === null || price === undefined) {
        return null;
    }

    // Derive the active subscription and priceId similar to CurrentActiveSubscription
    const activeSubscription = currentSubscription?.data?.stripe?.subscriptions?.[0];
    const currentPlanPriceId = activeSubscription?.items?.data?.[0]?.price?.id
        || activeSubscription?.items?.data?.[0]?.plan?.id
        || currentSubscription?.priceId;

    const isCurrentPlan = currentPlanPriceId === stripePriceId;
    const isSubscribed = !!currentSubscription;
    const subscriptionStatus = activeSubscription?.status || currentSubscription?.status;
    const databaseSubscriptionStatus = currentSubscription?.data?.user?.subscriptionStatus;
    const isCanceledAtPeriodEnd = activeSubscription?.cancel_at_period_end === true;
    const isCanceledInDatabase = databaseSubscriptionStatus === 'canceled';
    const isActiveCurrentPlan = isCurrentPlan && subscriptionStatus === 'active' && !isCanceledAtPeriodEnd;

    const cardClasses = `
    bg-customGray2 dark:bg-[#1D1C20] p-[24px] rounded-2xl flex flex-col h-full
    ${isPopular ? 'relative' : ''}
  `;

    const popularBadge = isPopular ? (
        // <div className="absolute top-6 right-6 bg-gray-100 dark:bg-customWhite backdrop-blur-sm text-sm font-semibold px-3 p-1 rounded-full flex items-center gap-[6px]">
        <div className={`absolute top-6 ${language === 'he' ? 'left-6' : 'right-6'} bg-gray-100 dark:bg-customWhite backdrop-blur-sm text-sm font-semibold px-3 p-1 rounded-full flex items-center gap-[6px]`}>
            <MdAutoAwesome className="text-purple-500 dark:text-purple-400 text-16" />
            <span className="font-bold bg-gradient-to-br from-[#FF2380] to-[#675DFF] text-transparent bg-clip-text text-14">
                {t.popular}
            </span>
        </div>
    ) : null;

    const cardWrapperClass = isPopular ? 'p-[2px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl' : 'border border-gray-300 dark:border-[#FFFFFF29] rounded-2xl';

    const handleAction = () => {
        if (isCurrentPlan) {
            if (!isActiveCurrentPlan) {
                onManageSubscription();
            }
            return;
        } else if (stripePriceId) {
            onSubscribe(stripePriceId, name, meterId);
        }
    };

    const getButtonText = () => {
        if (isCurrentPlan) {
            if (isCanceledInDatabase) return 'Subscription Canceled';
            if (isActiveCurrentPlan) return 'Current Plan';
            return currentSubscription?.status === 'canceled' ? 'Reactivate' : 'Manage Subscription';
        }
        return `Upgrade to ${name}`;
    };

    const getButtonProps = () => {
        if (isCurrentPlan) {
            return {
                text: getButtonText(),
                className: "w-full !py-3 !text-16 rounded-[8px]",
                onClick: handleAction,
                disabled: loading || isActiveCurrentPlan || isCanceledInDatabase
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
                    <h3 className="text-24 font-ttcommons text-gray-900 dark:text-white">{name}</h3>
                    <p className="text-gray-500 dark:text-[#FFFFFFCC] text-16">{description}</p>
                </div>

                <div className="mt-8 flex items-center gap-3">
                    <div>
                        <span className="text-36 font-bold text-gray-900 dark:text-white font-ttcommons">
                            {new Intl.NumberFormat(undefined, { style: 'currency', currency: currency?.toUpperCase?.() || 'USD' }).format(price)}
                        </span>
                        <span className="text-gray-500 dark:text-white text-24 font-ttcommons">
                            {isYearly ? t.perYear || '/year' : (isDaily ? '/day' : t.perMonth)}
                        </span>
                    </div>
                    {isMetered && (
                        <span className="px-2 py-1 text-12 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Usage-based</span>
                    )}
                </div>

                <div className="border-t border-gray-300 dark:border-commonBorder my-8"></div>

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

function Pricing({ slug, subscriptionLoading: subscriptionLoadingProp }) {
    const [isYearly, setIsYearly] = useState(false); // Default to monthly since all plans are monthly
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);

    // Fetch user data from API
    useEffect(() => {
        const fetchWhatsAppMessagesData = async () => {
            try {

                const response = await getAllWhatsAppMessagesData();
                if (response.success && response.data) {
                    // setApiWhatsAppMessagesData(response.data);
                } else {
                    // setApiError(response.message || 'Failed to fetch user data');
                }
            } catch (error) {
            }
        };

        fetchWhatsAppMessagesData();
    }, []);

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
    } = useStripeSubscription(slug);

    const handleToggle = () => {
        setIsYearly(prev => !prev);
    };

    // Get pricing plans from Stripe API only
    const getPricingPlans = () => {
        const plans = formatStripePricesToPlans(prices, t, isYearly);
        return plans;
    };

    const pricingPlans = getPricingPlans();

    const handlePlanSubscribe = (priceId, planName, meterId) => {
        if (!isAuthenticated) {
            // You can redirect to login or show login modal here
            return;
        }
        handleSubscribe(priceId, planName, meterId);
    };

    const handleManageSubscription = async () => {
        if (currentSubscription?.status === 'active') {
            handleOpenCustomerPortal();
        } else if (currentSubscription?.status === 'canceled') {
            await handleReactivateSubscription();
        }
    };

    return (
        <div className="bg-white dark:bg-customBrown text-gray-900 dark:text-white font-ttcommons p-6 border border-gray-200 dark:border-customBorderColor rounded-2xl mt-7 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <div className="md:flex justify-between items-center gap-6">
                <h1 className="text-24 font-ttcommons">{t.pricing}</h1>
                <BillingToggle isYearly={isYearly} onToggle={handleToggle} t={t} language={language} />
            </div>

            {/* Pricing Plans Grid - Show only after subscription loading is complete */}
            {subscriptionLoadingProp ? (
                <div className="mt-7 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600 dark:text-gray-400">Waiting for subscription data...</span>
                    </div>
                </div>
            ) : pricingPlans.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] mt-[24px] items-stretch">
                    {pricingPlans.map(plan => (
                        <PricingCard
                            key={plan.uniqueKey || `${plan.name}-${isYearly ? 'yearly' : 'monthly'}`}
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
