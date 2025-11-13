import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerById } from '../../redux/services/customerService';
import { IoArrowBack } from 'react-icons/io5';
import CommonButton from '../../components/commonComponent/CommonButton';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCustomerTranslations } from '../../utils/translations';
import { toast } from 'react-toastify';
import ReviewsTab from './ReviewsTab';
import AppointmentsTab from './AppointmentsTab';
import PaymentHistoryTab from './PaymentHistoryTab';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 p-1 text-xs font-semibold rounded-full inline-block text-center";
    let colorClasses = "";

    const statusLower = status?.toLowerCase();

    switch (statusLower) {
        case 'active':
        case 'פעיל':
            colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            break;
        case 'at risk':
        case 'בסיכון':
            colorClasses = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            break;
        case 'lost':
        case 'אבוד':
            colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            break;
        case 'recovered':
        case 'התאושש':
            colorClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            break;
        default:
            colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }

    return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

function ViewCustomer() {
    const navigate = useNavigate();
    const { customerId } = useParams();
    const { language } = useLanguage();
    const t = getUserCustomerTranslations(language);

    // Local state for customer data
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('reviews');

    // Fetch customer data when component mounts
    useEffect(() => {
        const fetchCustomer = async () => {
            if (!customerId) return;

            setLoading(true);
            setError(null);

            try {
                const response = await getCustomerById(customerId);
                setCustomer(response.data.customer || response.data);
            } catch (error) {
                console.error('Error fetching customer:', error);
                setError(error.message);
                toast.error(t.failedToLoadCustomer);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [customerId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-customBlack flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">{t.loadingCustomerDetails}</p>
                </div>
            </div>
        );
    }

    if (error || (!loading && !customer)) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-customBlack flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                        {error || t.customerNotFound}
                    </p>
                    <button
                        onClick={() => navigate('/app/customers')}
                        className="mt-4 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 mx-auto"
                        aria-label="Back to customers"
                    >
                        <IoArrowBack className="text-gray-600 dark:text-gray-300 text-lg" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-6 bg-gray-100 dark:bg-customBlack">
            <div className="w-full mx-auto">
                <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-4 md:p-8 shadow-lg">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 md:mb-8 gap-4">
                        <div className="flex flex-row sm:items-center justify-between gap-2 sm:gap-4 order-2 sm:order-1">
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">{t.customerDetailsTitle}</h1>
                            <StatusBadge status={customer.customerStatus || customer.status} />
                        </div>
                        <div className="order-1 sm:order-2">
                            <button
                                onClick={() => navigate('/app/customers')}
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
                                aria-label="Back to customers"
                            >
                                <IoArrowBack className="text-gray-600 dark:text-gray-300 text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Customer Basic Information - Always Visible */}
                    <div className="mb-6 md:mb-8">
                        <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">{t.basicInformation}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                        {t.employeeId}
                                    </label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white break-words">
                                        {customer.employeeId || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                        {t.firstName}
                                    </label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white break-words">
                                        {customer.firstName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                        {t.lastName}
                                    </label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white break-words">
                                        {customer.lastName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                        {t.fullName}
                                    </label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white break-words">
                                        {customer.customerFullName || `${customer.firstName} ${customer.lastName}` || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                        {t.email}
                                    </label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white break-words">
                                        {customer.email || customer.customerEmail || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                        {t.phoneNumber}
                                    </label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white break-words">
                                        {customer.customerPhone || customer.phoneNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation - Only Reviews and Appointments */}
                    <div className="flex border-b border-gray-200 dark:border-customBorderColor mb-6 md:mb-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'reviews'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Reviews ({customer.reviews?.filter(review => review.status !== 'sent').length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={`px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'appointments'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Appointments ({customer.appointments?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'payments'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Payment History ({customer.paymentHistory?.length || 0})
                        </button>
                    </div>

                    {/* Tab Content */}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <ReviewsTab customer={customer} t={t} />
                    )}

                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <AppointmentsTab customer={customer} t={t} />
                    )}

                    {/* Payment History Tab */}
                    {activeTab === 'payments' && (
                        <PaymentHistoryTab customer={customer} t={t} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewCustomer;
