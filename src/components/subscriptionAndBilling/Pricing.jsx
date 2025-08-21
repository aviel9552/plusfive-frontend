import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { MdAutoAwesome } from 'react-icons/md';
import { CommonButton, CommonOutlineButton } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';

// Data for pricing plans
const getPricingPlans = (t) => [
    {
        name: t.starter,
        description: t.starterDescription,
        monthlyPrice: 29,
        yearlyPrice: 24,
        features: [t.upTo100Customers, t.basicReports, t.emailSupport, t.integrations],
        isPopular: false,
    },
    {
        name: t.premium,
        description: t.premiumDescription,
        monthlyPrice: 69,
        yearlyPrice: 59,
        features: [t.upTo1000Customers, t.advancedReports, t.phoneSupport, t.integrations],
        isPopular: true,
    },
    {
        name: t.business,
        description: t.businessDescription,
        monthlyPrice: 149,
        yearlyPrice: 127,
        features: [t.unlimitedCustomers, t.allReports, t.support247, t.apiAccess],
        isPopular: false,
    },
];

// Toggle Switch Component
const BillingToggle = ({ isYearly, onToggle, t, language }) => (
    <div className="flex items-center md:justify-center justify-between gap-3 md:mt-0 mt-5">
        <div className='flex items-center justify-center gap-2'>
            <span className={`font-medium transition-colors ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.payMonthly}</span>
            <button
                onClick={onToggle}
                className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors focus:outline-none bg-gray-200 dark:bg-gray-700`}
            >
            <span className={` ${language === 'he' ? 'block' : 'hidden'}`}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${isYearly ? 'translate-x-6 bg-indigo-500' : 'translate-x-1'}`} />
            </button>
        </div>

        <div className='flex items-center justify-center gap-2'>
            <span className={`font-medium transition-colors ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.payYearly}</span>
            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs font-semibold px-2 py-1 rounded-md">
                15% {t.off}
            </span>
        </div>
    </div>
);

// Pricing Card Component
const PricingCard = ({ plan, isYearly, t }) => {
    const { name, description, monthlyPrice, yearlyPrice, features, isPopular } = plan;
    const price = isYearly ? yearlyPrice : monthlyPrice;

    const cardClasses = `
    bg-customGray2 dark:bg-customGray p-8 rounded-2xl flex flex-col h-full
    ${isPopular ? 'relative' : ''}
  `;

    const popularBadge = isPopular ? (
        <div className="absolute top-6 right-6 bg-gray-100 dark:bg-customWhite backdrop-blur-sm text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-2">
            <MdAutoAwesome className="text-purple-500 dark:text-purple-400 text-lg" />
            <span className="font-bold bg-gradient-to-br from-[#FF2380] to-[#675DFF] text-transparent bg-clip-text">
                {t.popular}
            </span>
        </div>
    ) : null;

    const cardWrapperClass = isPopular ? 'p-[2px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl' : 'border-2 border-gray-300 dark:border-customBorderColor rounded-2xl';

    return (
        <div className={cardWrapperClass}>
            <div className={cardClasses}>
                {popularBadge}
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{description}</p>

                <div className="mt-8">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">${price}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-lg">{t.perMonth}</span>
                </div>

                <div className="border-t border-gray-300 dark:border-gray-800 my-8"></div>

                <ul className="space-y-4 mb-10 flex-grow">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <FaCheckCircle className="text-violet-500 text-xl" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                    ))}
                </ul>

                {isPopular ? (
                    <CommonButton
                        text={`${t.upgrade} ${name}`}
                        className="w-full !py-3 !text-base rounded-full"
                    />
                ) : (
                    <CommonOutlineButton
                        text={`${t.upgrade} ${name}`}
                        className="w-full !py-3 !text-base rounded-full"
                        lightBgColor="#E9E9E9"
                        darkBgColor="#1D1C20"
                    />
                )}
            </div>
        </div>
    );
};

function Pricing() {
    const [isYearly, setIsYearly] = useState(true);
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);

    const handleToggle = () => {
        setIsYearly(prev => !prev);
    };

    const pricingPlans = getPricingPlans(t);

    return (
        <div className="bg-white dark:bg-customBrown text-gray-900 dark:text-white font-ttcommons p-6 border border-gray-200 dark:border-customBorderColor rounded-2xl mt-7 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <div className="md:flex justify-between items-center gap-6">
                <h1 className="text-4xl font-bold">{t.pricing}</h1>
                <BillingToggle isYearly={isYearly} onToggle={handleToggle} t={t} language={language} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-7 items-stretch">
                {pricingPlans.map(plan => (
                    <PricingCard key={plan.name} plan={plan} isYearly={isYearly} t={t} />
                ))}
            </div>
            <div className="max-w-6xl mx-auto">
            </div>
        </div>
    );
}

export default Pricing;
