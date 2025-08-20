import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerById } from '../../redux/services/customerService';
import { FaStar } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import CommonButton from '../../components/commonComponent/CommonButton';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCustomerTranslations } from '../../utils/translations';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block text-center";
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

const RatingStars = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const partialStarFill = rating - fullStars; // Decimal part (e.g., 0.3 for 3.3)
    const emptyStars = 5 - fullStars - (partialStarFill > 0 ? 1 : 0);

    return (
        <div className="flex items-center">
            {/* Full stars */}
            {[...Array(fullStars)].map((_, i) => (
                <FaStar key={`full-${i}`} className="text-[#FDB022]" />
            ))}
            
            {/* Partial star (if there's a decimal) */}
            {partialStarFill > 0 && (
                <div className="relative">
                    <FaStar className="text-gray-300 dark:text-white" />
                    <FaStar 
                        className="text-[#FDB022] absolute top-0 left-0" 
                        style={{ 
                            clipPath: `inset(0 ${100 - (partialStarFill * 100)}% 0 0)` 
                        }} 
                    />
                </div>
            )}
            
            {/* Empty stars */}
            {[...Array(emptyStars)].map((_, i) => (
                <FaStar key={`empty-${i}`} className="text-gray-300 dark:text-white" />
            ))}
        </div>
    );
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
                console.log('Customer data:', response);
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
                            Reviews ({customer.reviews?.length || 0})
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
                    </div>

                    {/* Tab Content */}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4 md:space-y-6">
                            {/* Review Statistics */}
                            {customer.reviewStatistics && (
                                <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">{t.reviewStatistics}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                        <div className="text-center">
                                            <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {customer.reviewStatistics.averageRating.toFixed(1)}
                                            </p>
                                            <p className="text-xs md:text-sm text-black dark:text-white">{t.averageRating}</p>
                                            <div className="flex justify-center mt-1 md:mt-2">
                                                <RatingStars rating={customer.reviewStatistics.averageRating} />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                                                {customer.reviewStatistics.totalReviews}
                                            </p>
                                            <p className="text-xs md:text-sm text-black dark:text-white">{t.totalReviews}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {customer.reviewStatistics.maxRating}
                                            </p>
                                            <p className="text-xs md:text-sm text-black dark:text-white">{t.highestRating}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                                                {customer.reviewStatistics.minRating}
                                            </p>
                                            <p className="text-xs md:text-sm text-black dark:text-white">{t.lowestRating}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Individual Reviews */}
                            <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
                                    {t.allReviews} ({customer.reviews?.length || 0})
                                </h2>
                                {customer.reviews && customer.reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {customer.reviews.map((review, index) => (
                                            <div key={review.id || index} className="bg-white dark:bg-customBrown p-4 md:p-6 rounded-lg border dark:border-customBorderColor">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                                    <div className="flex items-center gap-3 justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <RatingStars rating={review.rating} />
                                                            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                                                {review.rating}/5
                                                            </span>
                                                        </div>
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${review.status === 'received'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {review.status || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="md:text-right md:block flex items-center gap-2 justify-between">
                                                        <p className="text-sm text-black dark:text-white">
                                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-black dark:text-white">
                                                            {review.createdAt ? new Date(review.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                {review.message && (
                                                    <div className="bg-gray-50 dark:bg-customBlack p-4 rounded-lg">
                                                        <p className="text-black dark:text-white leading-relaxed">
                                                            {review.message}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="mt-4 grid md:grid-cols-3 grid-cols-1 gap-2 text-xs text-black dark:text-white">
                                                    <div>
                                                        <span className="font-medium">{t.reviewId}:</span>
                                                        <br />
                                                        <span className="font-mono break-all text-xs">{review.id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">{t.customerId}:</span>
                                                        <br />
                                                        <span className="font-mono break-all text-xs">{review.customerId}</span>
                                                    </div>
                                                    {review.userId && (
                                                        <div>
                                                            <span className="font-medium">{t.userId}:</span>
                                                            <br />
                                                            <span className="font-mono break-all text-xs">{review.userId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">⭐</div>
                                        <p className="text-black dark:text-white text-lg">{t.noReviewsYet}</p>
                                        <p className="text-black dark:text-white text-sm mt-2">{t.customerHasntLeftReviews}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div className="space-y-4 md:space-y-6">
                            {/* Appointment Statistics */}
                            <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">{t.appointmentSummary}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {customer.totalAppointmentCount || 0}
                                        </p>
                                        <p className="text-xs md:text-sm text-black dark:text-white">{t.totalAppointments}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                                            {customer.appointments?.length || 0}
                                        </p>
                                        <p className="text-xs md:text-sm text-black dark:text-white">{t.detailedRecords}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            ${customer.totalSpent || 0}
                                        </p>
                                        <p className="text-xs md:text-sm text-black dark:text-white">{t.totalSpent}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Last Appointment Details */}
                            {customer.lastAppointmentDetails && (
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 md:p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">📅</span>
                                        {t.lastAppointment}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-black dark:text-white">{t.dateTime}</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {new Date(customer.lastAppointmentDetails.startDate).toLocaleDateString('en-GB')} at {new Date(customer.lastAppointmentDetails.startDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-black dark:text-white">{t.services}</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {customer.lastAppointmentDetails.selectedServices || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* All Appointments */}
                            <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
                                    {t.allAppointments} ({customer.appointments?.length || 0})
                                </h2>
                                {customer.appointments && customer.appointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {customer.appointments.map((appointment, index) => (
                                            <div key={appointment.id || index} className="bg-white dark:bg-customBrown p-4 md:p-6 rounded-lg border dark:border-customBorderColor">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                                    <div className="flex items-center gap-3 justify-between">
                                                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                                                            <span className="text-blue-600 dark:text-blue-400 font-semibold">#{index + 1}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {new Date(appointment.startDate).toLocaleDateString('en-GB')}
                                                            </p>
                                                            <p className="text-sm text-black dark:text-white">
                                                                {new Date(appointment.startDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="md:text-right md:block flex items-center gap-2 justify-between">
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {t.duration}: {appointment.duration || 'N/A'}
                                                        </p>
                                                        {appointment.source && (
                                                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded">
                                                                {appointment.source}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <p className="text-sm text-black dark:text-white font-medium">{t.services}:</p>
                                                        <p className="text-sm text-gray-900 dark:text-white break-words">
                                                            {appointment.selectedServices || customer.selectedServices || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-black dark:text-white font-medium">{t.appointmentId}:</p>
                                                        <p className="font-mono text-xs text-black dark:text-white break-all">
                                                            {appointment.id}
                                                        </p>
                                                    </div>
                                                </div>

                                                {appointment.notes && (
                                                    <div className="mt-4 bg-gray-50 dark:bg-customBlack p-3 rounded">
                                                        <p className="text-sm text-black dark:text-white font-medium">{t.notes}:</p>
                                                        <p className="text-sm text-black dark:text-white mt-1">{appointment.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">📅</div>
                                        <p className="text-black dark:text-white text-lg">{t.noAppointmentsFound}</p>
                                        <p className="text-black dark:text-white text-sm mt-2">{t.noAppointmentRecords}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewCustomer;
