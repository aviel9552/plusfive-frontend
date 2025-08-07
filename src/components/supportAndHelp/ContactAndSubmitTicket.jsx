import React, { useState } from 'react';
import { BsChatDots } from 'react-icons/bs';
import { FiPhone, FiMail } from 'react-icons/fi';
import { CommonButton, CommonInput } from '../index';
import { LuMessageSquare } from 'react-icons/lu';
import { useLanguage } from '../../context/LanguageContext';
import { getUserSupportTranslations } from '../../utils/translations';

function ContactAndSubmitTicket() {
    const { language } = useLanguage();
    const t = getUserSupportTranslations(language);
    const [ticketData, setTicketData] = useState({
        subject: '',
        description: '',
    });

    const [errors, setErrors] = useState({});


    const validate = () => {
        const newErrors = {};
        if (!ticketData.subject) newErrors.subject = t.subjectRequired || 'Subject is required';
        if (!ticketData.description) newErrors.description = t.descriptionRequired || 'Description is required';
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTicketData({ ...ticketData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            console.log('Ticket Submitted:', ticketData);
            // Handle submission logic
        }
    };

    const contactMethods = [
        {
            icon: <LuMessageSquare className="md:text-3xl text-2xl text-pink-500" />,
            title: t.liveChat || 'Live Chat',
            detail: t.availableMondayToFriday || 'Available Monday to Friday 9:00-18:00',
            action: <CommonButton text={t.startChat || "Start Chat"} className="!text-white rounded-lg md:px-6 md:py-2 md:text-xl text-sm px-4 py-2" />,
        },
        {
            icon: <FiPhone className="md:text-3xl text-2xl text-pink-500" />,
            title: t.phone || 'Phone',
            detail: '+103-1234567',
        },
        {
            icon: <FiMail className="md:text-3xl text-2xl text-pink-500" />,
            title: t.email || 'Email',
            detail: 'support@plusfive.io',
        },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Section */}
            <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <h2 className="text-3xl font-bold mb-8">{t.contact || 'Contact'}</h2>
                <div className="space-y-6">
                    {contactMethods.map((method, index) => (
                        <div key={index} className="dark:bg-customBrown bg-customBody border border-gray-200 dark:border-customBorderColor p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex flex-row items-start flex-1 min-w-0 mr-0 sm:mr-4">
                                <div className="mr-4 md:text-2xl border border-gray-200 dark:border-customBorderColor rounded-lg md:p-3 p-2 bg-white dark:bg-customBrown flex-shrink-0">{method.icon}</div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold md:text-xl leading-tight">{method.title}</h3>
                                    <p className="text-gray-500 dark:text-white md:text-lg leading-tight">{method.detail}</p>
                                    {method.action && (
                                        <div className="mt-4">
                                            {method.action}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Ticket Section */}
            <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <h2 className="text-3xl font-bold mb-8">{t.submitTicket || 'Submit Ticket'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CommonInput
                        label={t.ticketSubject || "Ticket Subject"}
                        id="subject"
                        name="subject"
                        value={ticketData.subject}
                        onChange={handleChange}
                        error={errors.subject}
                        placeholder={t.enterIssuesSubject || "Enter issues subject name..."}
                    />

                    <CommonInput
                        as="textarea"
                        label={t.ticketSubject || "Ticket Subject"}
                        id="description"
                        name="description"
                        value={ticketData.description}
                        onChange={handleChange}
                        error={errors.description}
                        placeholder={t.describeIssues || "Describe the issues..."}
                    />

                    <div>
                        <CommonButton
                            text={t.submitTicketButton || "Submit Ticket"}
                            type="submit"
                            className="w-full !text-white rounded-lg py-3 text-xl"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ContactAndSubmitTicket;
