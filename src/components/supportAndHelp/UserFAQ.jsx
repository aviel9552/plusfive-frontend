import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const faqData = [
    {
        question: 'How do I create a QR code?',
        answer: 'To create a QR code, navigate to the QR Management section from the sidebar. Click on "Generate QR Code", fill in the required details, and your QR code will be generated instantly.'
    },
    {
        question: 'How do I view my performance?',
        answer: 'You can view your performance analytics in the Analytics section. It provides detailed charts and metrics on your monthly performance, customer LTV, and more.'
    },
    {
        question: 'How do I update payment details?',
        answer: 'To update your payment details, go to the Subscription & Billing section. From there, you can manage your payment methods and update your billing information.'
    },
    {
        question: 'What is customer LTV?',
        answer: 'Customer Lifetime Value (LTV) is a metric that represents the total revenue a business can reasonably expect from a single customer account throughout their relationship. Our platform helps you track this.'
    }
];

function FaqItem({ faq, index, openIndex, setOpenIndex }) {
    const isOpen = index === openIndex;

    return (
        <div className="border dark:bg-customBrown bg-customBody dark:border-customBorderColor rounded-xl">
            <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center text-left p-4"
            >
                <span className="md:text-xl text-lg font-medium">{faq.question}</span>
                <FiChevronDown
                    className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'
                    }`}
            >
                <p className="text-black dark:text-customWhite md:text-lg text-base p-4 pt-0">
                    {faq.answer}
                </p>
            </div>
        </div>
    );
}

function UserFAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <h2 className="text-3xl font-bold mb-8">FAQ</h2>
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
