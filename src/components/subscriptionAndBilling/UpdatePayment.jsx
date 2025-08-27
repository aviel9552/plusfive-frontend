import React, { useState } from 'react';
import { FiCreditCard, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { GoShieldLock } from "react-icons/go";
import { CommonButton } from '../index';
import { useNavigate } from 'react-router-dom';
import { BillingInformation } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import AddNewCreditCard from './AddNewCreditCard';

function UpdatePayment({ slug }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);
    const [currentView, setCurrentView] = useState('main'); // 'main' or 'add'
    
    const {
        paymentMethods,
        loading,
        adding,
        handleAddPaymentMethod,
        handleRemovePaymentMethod,
        isAuthenticated
    } = usePaymentMethods();
    
    const handleAddCard = () => {
        setCurrentView('add');
    };
    
    const handleAddPaymentMethodSubmit = async (paymentData) => {
        try {
            await handleAddPaymentMethod(paymentData);
            setCurrentView('main');
        } catch (error) {
            // Error is already handled in the hook
        }
    };
    
    if (!isAuthenticated) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                    Please login to manage your payment methods.
                </p>
            </div>
        );
    }

    // Show Add New Credit Card view
    if (currentView === 'add') {
        return (
            <div className='text-black dark:text-white'>
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => setCurrentView('main')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                    >
                        ← Back to Payment Settings
                    </button>
                </div>
                <AddNewCreditCard 
                    onSubmit={handleAddPaymentMethodSubmit}
                    onCancel={() => setCurrentView('main')}
                />
            </div>
        );
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

                {/* Debug Payment Methods Data */}
                {!loading && (
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            <strong>Debug Info:</strong> paymentMethods type: {typeof paymentMethods}, 
                            isArray: {Array.isArray(paymentMethods)}, 
                            length: {Array.isArray(paymentMethods) ? paymentMethods.length : 'N/A'}
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                            Raw data: {JSON.stringify(paymentMethods, null, 2)}
                        </p>
                    </div>
                )}

                {/* Error Display for non-array paymentMethods */}
                {!loading && !Array.isArray(paymentMethods) && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FiAlertCircle className="text-red-600 dark:text-red-400 text-xl" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                                    Payment Methods Data Issue
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                    Expected array but received: {typeof paymentMethods}. Please check the API response structure.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="dark:bg-[#121212] bg-gray-50 p-6 rounded-xl flex justify-center items-center border border-gray-200 dark:border-customBorderColor">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payment methods...</span>
                    </div>
                ) : Array.isArray(paymentMethods) && paymentMethods.length === 0 ? (
                    <div className="dark:bg-[#121212] bg-gray-50 p-6 rounded-xl flex flex-col items-center justify-center border border-gray-200 dark:border-customBorderColor text-center">
                        <FiCreditCard className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-3">No payment methods found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add a payment method to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Array.isArray(paymentMethods) && paymentMethods.map((pm) => (
                            <div key={pm.id} className="dark:bg-[#121212] bg-gray-50 p-6 rounded-xl flex justify-between items-center border border-gray-200 dark:border-customBorderColor">
                                <div className="flex items-center gap-6">
                                    <FiCreditCard className="w-10 h-10 text-purple-400 bg-purple-200 dark:bg-purple-900/50 p-2 rounded-md" />
                                    <div>
                                        <p className="font-bold text-lg">
                                            {pm.brand || 'Card'} **** **** **** {pm.last4 || '••••'}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {pm.expMonth}/{pm.expYear}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    className="text-customRed font-semibold hover:text-red-700"
                                    onClick={() => handleRemovePaymentMethod(pm.id)}
                                >
                                    {t.remove}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Billing Information Section */}
            <BillingInformation />
        </div>
    );
}

export default UpdatePayment;