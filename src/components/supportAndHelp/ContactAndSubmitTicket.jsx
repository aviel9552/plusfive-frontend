import React, { useState } from 'react';
import { BsChatDots } from 'react-icons/bs';
import { FiPhone, FiMail } from 'react-icons/fi';
import { CommonButton, CommonInput } from '../index';
import { LuMessageSquare } from 'react-icons/lu';
import { useLanguage } from '../../context/LanguageContext';
import { getUserSupportTranslations } from '../../utils/translations';
import ChatIcon from '../../assets/Chat1.svg'
import PhoneIcon from '../../assets/Call.svg'
import MailIcon from '../../assets/Mail.svg'
import { createSupportTicket, sendSupportEmail } from '../../redux/services/supportAndHelp';

function ContactAndSubmitTicket() {
    const { language } = useLanguage();
    const t = getUserSupportTranslations(language);
    
    // Phone number variable - change here to update everywhere
    const supportPhoneNumber = '+972523042776';
    
    // Support email variable - change here to update everywhere
    const supportEmail = 'support@plusfive.io';
    
    // Format phone number for display
    const formatPhoneNumber = (phone) => {
        // Format: +972-52-304-2776
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 12) {
            return `+${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
        }
        return phone;
    };
    
    const [ticketData, setTicketData] = useState({
        subject: '',
        description: '',
        email: supportEmail,
    });

    const [errors, setErrors] = useState({});


    const validate = () => {
        const newErrors = {};
        if (!ticketData.subject) newErrors.subject = t.subjectRequired;
        if (!ticketData.description) newErrors.description = t.descriptionRequired;
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTicketData({ ...ticketData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            try {
                // Create support ticket
                const ticketResponse = await createSupportTicket({
                    subject: ticketData.subject,
                    description: ticketData.description,
                    email: 'dev2.webbuildinfotech@gmail.com',
                    // email: supportEmail,
                    priority: 'medium',
                    category: 'general'
                });
                
                
                
                // Reset form after successful submission
                setTicketData({
                    subject: '',
                    description: '',
                    email: supportEmail
                });
                
                // Show success message or redirect
                alert('Support ticket submitted successfully!');
                
            } catch (error) {
                console.error('Error submitting ticket:', error);
                alert('Failed to submit ticket. Please try again.');
            }
        }
    };

    const contactMethods = [
        {
            icon: <img src={ChatIcon} alt="Chat" className="text-24 text-pink-500" />,
            title: t.liveChat,
            detail: t.availableMondayToFriday,
            action: <CommonButton 
                text={t.startChat} 
                className="!text-white rounded-lg md:px-6 md:py-2 md:text-14 text-sm px-4 py-2"
                onClick={() => {
                    const whatsappURL = `https://wa.me/${supportPhoneNumber.replace('+', '')}`;
                    window.open(whatsappURL, '_blank');
                }}
            />,
        },
        {
            icon: <img src={PhoneIcon} alt="Phone" className="text-24 text-pink-500" />,
            title: t.phone,
            detail: formatPhoneNumber(supportPhoneNumber),
        },
        {
            icon: <img src={MailIcon} alt="Mail" className="text-24 text-pink-500" />,
            title: t.email,
            detail: supportEmail,
        },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Section */}
            <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <h2 className="text-24 font-ttcommons mb-[24px]">{t.contact}</h2>
                <div className="space-y-6">
                    {contactMethods.map((method, index) => (
                        <div key={index} className="dark:bg-customBrown bg-customBody border border-gray-200 dark:border-customBorderColor p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex flex-row items-start flex-1 min-w-0 gap-4">
                                <div className="md:text-2xl border border-gray-200 dark:border-customBorderColor rounded-lg md:p-3 p-2 bg-white dark:bg-customBrown flex-shrink-0">{method.icon}</div>
                                <div className="flex md:flex-row flex-col justify-between w-full">
                                    <div>

                                        <h3 className="font-bold md:text-18 leading-tight">{method.title}</h3>
                                        <p className="text-gray-500 dark:text-white md:text-14 leading-tight">{method.detail}</p>
                                    </div>
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
                <h2 className="text-24 font-ttcommons mb-[24px]">{t.submitTicket}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CommonInput
                        label={t.ticketSubject}
                        id="subject"
                        name="subject"
                        value={ticketData.subject}
                        onChange={handleChange}
                        error={errors.subject}
                        placeholder={t.enterIssuesSubject}
                        labelFontSize="text-14"
                    />

                    <CommonInput
                        as="textarea"
                        label={t.ticketSubject}
                        id="description"
                        name="description"
                        value={ticketData.description}
                        onChange={handleChange}
                        error={errors.description}
                        placeholder={t.describeIssues}  
                        labelFontSize="text-14"
                    />

                    <div>
                        <CommonButton
                            text={t.submitTicketButton}
                            type="submit"
                            className="w-full !text-white rounded-lg py-3 text-14"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ContactAndSubmitTicket;
