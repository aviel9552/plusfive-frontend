import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaBuilding, FaCalendar, FaCreditCard, FaStar } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminUserTranslations } from '../../../utils/translations';
import { toast } from 'react-toastify';
import { getUserById } from '../../../redux/services/userServices';
import { formatPhoneForDisplay } from '../../../utils/phoneHelpers';

const ViewUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = getAdminUserTranslations(language);
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // Fetch user data from API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await getUserById(userId);
                
                if (response.success && response.data) {
                    setUser(response.data);
                } else {
                    setError(response.message || 'Failed to fetch user data');
                }
            } catch (error) {
                console.error('💥 Error fetching user:', error);
                setError(error.message || 'Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const handleBack = () => {
        navigate('/admin/user-management');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-customBrown p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="loader"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">{t.loadingUsers}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-customBrown p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-red-500 text-center">
                            <p className="text-lg font-semibold mb-2">{t.errorLoadingUsers}</p>
                            <p className="text-sm text-black dark:text-white">{error || 'User not found'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20';
            case 'suspended':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            case 'inactive':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            case 'expired':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            default:
                return 'text-green-600 bg-green-100 dark:bg-green-900/20';
        }
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'text-white bg-gray-900 dark:bg-gray-800';
            case 'manager':
                return 'text-blue-200 bg-blue-900 dark:bg-blue-800';
            case 'user':
                return 'text-white bg-gray-700 dark:bg-gray-600';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getPlanColor = (plan) => {
        switch (plan?.toLowerCase()) {
            case 'premium':
                return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
            case 'standard':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
            case 'basic':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 text-black dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                            title="Back to Users"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                {t.userDetails}
                            </h1>
                            <p className="text-black dark:text-white">
                                {user.firstName} {user.lastName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Basic Information - Always Visible */}
                <div className="bg-white dark:bg-customBlack rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <FaUser className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-black dark:text-white">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.subscriptionStatus)}`}>
                                    {user.subscriptionStatus ? user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1) : 'N/A'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-black dark:text-white">{t.phone}</label>
                            <p className="text-gray-900 dark:text-white">{user.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-black dark:text-white">{t.businessName}</label>
                            <p className="text-gray-900 dark:text-white">{user.businessName || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-black dark:text-white">{t.businessType}</label>
                            <p className="text-gray-900 dark:text-white">{user.businessType || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-black dark:text-white">{t.address}</label>
                            <p className="text-gray-900 dark:text-white">{user.address || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-black dark:text-white">{t.joiningDate}</label>
                            <p className="text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-black dark:text-white">{t.subscriptionPlan}</label>
                            <p className="text-gray-900 dark:text-white">{user.subscriptionPlan ? user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1) : 'N/A'}</p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default ViewUser;
