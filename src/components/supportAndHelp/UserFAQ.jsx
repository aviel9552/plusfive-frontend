import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { getUserSupportTranslations } from '../../utils/translations';

const UserFAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const { language } = useLanguage();
    const t = getUserSupportTranslations(language);

    const getFaqData = (t) => [
        {
            question: t.howToCreateQRCode,
            answer: t.howToCreateQRCodeAnswer
        },
        {
            question: t.howToViewPerformance,
            answer: t.howToViewPerformanceAnswer
        },
        {
            question: t.howToUpdatePayment,
            answer: t.howToUpdatePaymentAnswer
        },
        {
            question: t.whatIsCustomerLTV,
            answer: t.whatIsCustomerLTVAnswer
        }
    ];

    const faqData = getFaqData(t);

    function FaqItem({ faq, index, openIndex, setOpenIndex }) {
        const isOpen = index === openIndex;

        return (
            <div className="border dark:bg-customBrown bg-customBody dark:border-customBorderColor rounded-xl">
                <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left p-4"
                >
                    <span className="md:text-18 text-lg font-medium">{faq.question}</span>
                    <FiChevronDown
                        className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                >
                    <p className="text-black dark:text-white md:text-18 text-base p-4 pt-0">
                        {faq.answer}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <h2 className="text-24 font-bold mb-8">{t.faq}</h2>
            <div className="space-y-4">
                {faqData.map((faq, index) => (
                    <FaqItem
                        key={index}
                        faq={faq}
                        index={index}
                        openIndex={openIndex}
                        setOpenIndex={setOpenIndex}
                    />
                ))}
            </div>
        </div>
    );
}

export default UserFAQ;
