import React, { useState } from 'react';
import { FiCreditCard, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { GoShieldLock } from "react-icons/go";
import { CommonButton, CommonConfirmModel } from '../index';
import { useNavigate } from 'react-router-dom';
import { BillingInformation } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import StripePaymentForm from './StripePaymentForm';
import { toast } from 'react-toastify';

function UpdatePayment({ slug }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);
    const [currentView, setCurrentView] = useState('main'); // 'main' or 'add'
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, paymentMethod: null });
    const [editModal, setEditModal] = useState({ isOpen: false, paymentMethod: null });

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
            // The paymentData now contains the Stripe payment method ID and card details
            await handleAddPaymentMethod(paymentData);
            setCurrentView('main');
            
            // Refresh payment methods to show the new one
            // The hook will handle this automatically
        } catch (error) {
            // Error is already handled in the hook
            console.error('Failed to add payment method:', error);
        }
    };

    const handleDeleteClick = (paymentMethod) => {
        setDeleteModal({ isOpen: true, paymentMethod });
    };

    const handleConfirmDelete = async () => {
        if (deleteModal.paymentMethod) {
            await handleRemovePaymentMethod(deleteModal.paymentMethod.id);
            setDeleteModal({ isOpen: false, paymentMethod: null });
        }
    };

    const handleCloseDeleteModal = () => {
        setDeleteModal({ isOpen: false, paymentMethod: null });
    };


    const handleCloseEditModal = () => {
        setEditModal({ isOpen: false, paymentMethod: null });
    };

    const handleConfirmEdit = async (updatedData) => {
        if (editModal.paymentMethod) {
            try {
                // Here you would call your API to update the payment method
                // await updatePaymentMethod(editModal.paymentMethod.id, updatedData);
                toast.success('Payment method updated successfully!');
                setEditModal({ isOpen: false, paymentMethod: null });
            } catch (error) {
                toast.error('Failed to update payment method');
            }
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
                        ← {t.backToPaymentSettings || 'Back to Payment Settings'}
                    </button>
                </div>
                <StripePaymentForm
                    onSubmit={handleAddPaymentMethodSubmit}
                    onCancel={() => setCurrentView('main')}
                    onSuccess={() => setCurrentView('main')}
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
                    <h2 className="text-24 font-ttcommons ">{t.secureAndEncrypted}</h2>
                    <p className="text-14 text-black dark:text-white">{t.secureDescriptionSSL}</p>
                </div>
            </div>

            {/* Current Payment Methods Section */}
            <div className="dark:bg-customBrown bg-white p-[24px] rounded-2xl border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[24px] ">{t.currentPaymentMethods}</h2>
                    <CommonButton
                        text={t.addCard}
                        onClick={handleAddCard}
                        icon={<FiPlus className="text-xl" />}
                        className=" text-white  py-2 px-4 rounded-lg flex items-center text-[14px]"
                    />
                </div>

                
               
                {loading ? (
                    <div className="dark:bg-[#121212] bg-gray-50 p-6 rounded-xl flex justify-center items-center border border-gray-200 dark:border-customBorderColor">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payment methods...</span>
                    </div>
                ) : (!paymentMethods?.paymentMethods || paymentMethods.paymentMethods.length === 0) ? (
                    <div className="dark:bg-[#121212] bg-gray-50 p-6 rounded-xl flex flex-col items-center justify-center border border-gray-200 dark:border-customBorderColor text-center">
                        <FiCreditCard className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-3">No payment methods found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add a payment method to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paymentMethods.paymentMethods.map((pm) => (
                            <div key={pm.id} className="dark:bg-[#121212] bg-gray-50 p-6 rounded-xl flex justify-between items-center border border-gray-200 dark:border-customBorderColor">
                                <div className="flex items-center gap-6">
                                    <FiCreditCard className="w-10 h-10 bg-[#C7BAFF] text-[#675DFF] p-2 rounded-md" />
                                    <div>
                                        <p className=" text-lg">
                                            {pm.card?.brand_display || pm.card?.brand || 'Card'} **** **** **** {pm.card?.last4 || '••••'}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Expires {pm.card?.expiry_date || `${pm.card?.exp_month}/${pm.card?.exp_year}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="text-customRed font-semibold hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        onClick={() => handleDeleteClick(pm)}Card Information
                                    >
                                        {t.remove}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Billing Information Section */}
            <BillingInformation />

            {/* Delete Confirmation Modal */}
            <CommonConfirmModel
                isOpen={deleteModal.isOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title={t.removePaymentMethod || 'Remove Payment Method'}
                message={t.removePaymentMethodMessage 
                    ? t.removePaymentMethodMessage
                        .replace('{brand}', deleteModal.paymentMethod?.card?.brand_display || deleteModal.paymentMethod?.card?.brand || 'card')
                        .replace('{last4}', deleteModal.paymentMethod?.card?.last4 || '••••')
                    : `Are you sure you want to remove this ${deleteModal.paymentMethod?.card?.brand_display || deleteModal.paymentMethod?.card?.brand || 'card'} ending in ${deleteModal.paymentMethod?.card?.last4 || '••••'}? This action cannot be undone.`}
                confirmText={t.remove || 'Remove'}
                cancelText={t.cancel || 'Cancel'}
                confirmButtonColor="bg-gradient-to-r from-customRed to-orange-500 hover:from-orange-500 hover:to-customRed focus:ring-2 focus:ring-orange-400"
            />

            {/* Edit Payment Method Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
                        onClick={handleCloseEditModal}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative bg-white/90 dark:bg-customBlack/90 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden backdrop-blur-md border border-customGray2 dark:border-customGray flex flex-col animate-fadeIn">
                        {/* Header */}
                        <div className="px-8 pt-6 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                    <FiCreditCard className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl  text-gray-900 dark:text-white tracking-tight">
                                    Edit Payment Method
                                </h3>
                            </div>
                            
                            {/* Close Button */}
                            <button
                                onClick={handleCloseEditModal}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-customGray focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Close"
                            >
                                <FiAlertCircle size={20} />
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-b border-customGray2 dark:border-customGray mx-8" />

                        {/* Body */}
                        <div className="px-8 py-6">
                            <div className="space-y-4">
                                {/* Card Info Display */}
                                <div className="bg-gray-50 dark:bg-customGray p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Card:</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {editModal.paymentMethod?.card?.brand || 'Card'} **** **** **** {editModal.paymentMethod?.card?.last4 || '••••'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Expires: {editModal.paymentMethod?.card?.exp_month}/{editModal.paymentMethod?.card?.exp_year}
                                    </p>
                                </div>

                                {/* Edit Form - Only Dynamic Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Card Brand
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-customBorderColor rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-customGray dark:text-white"
                                            value={editModal.paymentMethod?.card?.brand || ''}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Last 4 Digits
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-customBorderColor rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-customGray dark:text-white"
                                            value={editModal.paymentMethod?.card?.last4 || ''}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Expiry Month
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-customBorderColor rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-customGray dark:text-white"
                                            value={editModal.paymentMethod?.card?.exp_month || ''}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Expiry Year
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-customBorderColor rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-customGray dark:text-white"
                                            value={editModal.paymentMethod?.card?.exp_year || ''}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Card Type
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-customBorderColor rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-customGray dark:text-white"
                                            value={editModal.paymentMethod?.type || ''}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50/80 dark:bg-customGray/80 flex justify-end gap-4">
                            <button
                                onClick={handleCloseEditModal}
                                className="px-6 pt-3 pb-2 text-sm font-medium rounded-lg transition-all duration-200 bg-customGray2 dark:bg-customIconBgColor hover:bg-gray-400 dark:hover:bg-customBorderColor focus:ring-2 focus:ring-gray-400 text-gray-700 dark:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleConfirmEdit({})}
                                className="px-6 pt-3 pb-2 text-sm font-semibold text-white rounded-lg shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-blue-400"
                            >
                                Update Card
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UpdatePayment;