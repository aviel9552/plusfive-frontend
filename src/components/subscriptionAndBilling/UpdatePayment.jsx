import React from 'react';
import { FiCreditCard, FiPlus } from 'react-icons/fi';
import { GoShieldLock } from "react-icons/go";
import { CommonButton } from '../index';
import { useNavigate } from 'react-router-dom';
import { BillingInformation } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';

function UpdatePayment() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);
    
    const handleAddCard = () => {
        navigate('/app/add-card');
    }
    
    return (
        <div className='text-black dark:text-white'>
            {/* Secure & Encrypted Section */}
            <div className="flex items-center mb-8 gap-4">
                <GoShieldLock className="w-8 h-8 text-blue-500" />
                <div>
                    <h2 className="text-xl font-bold">{t.secureAndEncrypted}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{t.secureDescriptionSSL}</p>
                </div>
            </div>

            {/* Current Payment Methods Section */}
            <div className="dark:bg-customBrown bg-white p-8 rounded-2xl border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t.currentPaymentMethods}</h2>
                    <CommonButton
                        text={t.addCard}
                        onClick={handleAddCard}
                        icon={<FiPlus className="text-xl" />}
                        className=" text-white font-bold py-2 px-4 rounded-lg flex items-center text-xl"
                    />
                </div>
                <div className="dark:bg-[#121212] bg-gray-50 p-6 rounded-xl flex justify-between items-center border border-gray-200 dark:border-customBorderColor">
                    <div className="flex items-center gap-6">
                        <FiCreditCard className="w-10 h-10 text-purple-400 bg-purple-200 dark:bg-purple-900/50 p-2 rounded-md" />
                        <div>
                            <p className="font-bold text-lg">Visa **** **** **** 4242</p>
                            <p className="text-gray-500 dark:text-gray-400">12/2027</p>
                        </div>
                    </div>
                    <button className="text-customRed font-semibold">{t.remove}</button>
                </div>
            </div>

            {/* Billing Information Section */}
            <BillingInformation />
        </div>
    );
}

export default UpdatePayment;