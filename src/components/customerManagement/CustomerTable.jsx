import React, { useState, useMemo } from 'react';
import { FaStar } from 'react-icons/fa';
import CommonOutlineButton from '../commonComponent/CommonOutlineButton';
import CommonTable from '../commonComponent/CommonTable';
import { PiChatsCircleBold } from 'react-icons/pi';
import CommonButton from '../commonComponent/CommonButton';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCustomerTranslations } from '../../utils/translations';
import { IoMdDownload } from 'react-icons/io';
import { toast } from 'react-toastify';
import reviewService from '../../redux/services/reviewServices';
import CommonConfirmModel from '../commonComponent/CommonConfirmModel';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block text-center";
    let colorClasses = "";
    
    // Convert status to lowercase for case-insensitive matching
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
    const emptyStars = 5 - fullStars;

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="text-[#FDB022]" />)}
            {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300 dark:text-white" />)}
        </div>
    );
};

function CustomerTable({ customers = [], loading = false }) {
    const { language } = useLanguage();
    const t = getUserCustomerTranslations(language);
    
    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState(t.allServices);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [sendingRating, setSendingRating] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [customerToSendRating, setCustomerToSendRating] = useState(null);

    const filterOptions = [t.allServices, ...new Set(customers.map(c => c.selectedServices).filter(Boolean))];

    const filteredData = useMemo(() => {
        let data = customers;

        if (filterValue && filterValue !== t.allServices) {
            data = data.filter(item => item.selectedServices === filterValue);
        }

        if (searchValue) {
            const lowercasedValue = searchValue.toLowerCase();
            data = data.filter(item =>
                item.employeeId?.toString().toLowerCase().includes(lowercasedValue) ||
                item.firstName?.toLowerCase().includes(lowercasedValue) ||
                item.lastName?.toLowerCase().includes(lowercasedValue) ||
                item.customerEmail?.toLowerCase().includes(lowercasedValue) ||
                item.customerPhone?.toLowerCase().includes(lowercasedValue)
            );
        }

        return data;
    }, [customers, searchValue, filterValue]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end);
    }, [currentPage, pageSize, filteredData]);

    // Show confirmation modal before sending rating request
    const handleWhatsAppClick = (customer) => {
        setCustomerToSendRating(customer);
        setShowConfirmModal(true);
    };

    // Send rating request function using reviewService
    const handleSendRatingRequest = async () => {
        if (!customerToSendRating) return;
        
        setSendingRating(customerToSendRating.id);
        setShowConfirmModal(false);
        
        try {
            const requestData = {
                customerId: customerToSendRating.id,
                customerType: 'regular',
                useAlt: false
            };
            
            const result = await reviewService.sendRatingRequest(requestData);
            
            if (result.success) {
                toast.success(`Rating request sent successfully to ${customerToSendRating.customerFullName || customerToSendRating.firstName}!`);
                console.log('Rating request response:', result.data);
            } else {
                toast.error(result.error || 'Failed to send rating request');
            }
        } catch (error) {
            console.error('Rating request error:', error);
            toast.error('An error occurred while sending rating request');
        } finally {
            setSendingRating(null);
            setCustomerToSendRating(null);
        }
    };

    // Close confirmation modal
    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        setCustomerToSendRating(null);
    };

    const columns = [
        { 
            key: 'employeeId', 
            label: t.userId, 
            className: 'text-sm text-gray-900 dark:text-white',
            render: (row) => <span className="text-sm text-gray-900 dark:text-white">{row.employeeId}</span>
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (row) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                        {row.customerFullName || `${row.firstName} ${row.lastName}`}
                    </div>
                    <div className="text-black dark:text-white">{row.email || t.noDataAvailable}</div>
                    <div className="text-black dark:text-white">{row.customerPhone || t.noDataAvailable}</div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <StatusBadge status={row.customerStatus || row.status} />
            )
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (row) => (
                <div className="flex flex-col items-start">
                    {row.reviewStatistics?.averageRating ? (
                        <>
                            <div className="flex items-center gap-2">
                                <RatingStars rating={row.reviewStatistics.averageRating} />
                                <span className="dark:text-white font-bold text-lg">
                                    {row.reviewStatistics.averageRating.toFixed(1)}
                                </span>
                            </div>
                            {row.reviews && row.reviews.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="dark:text-white text-sm">Last:</span>
                                    <span className="dark:text-white text-sm font-bold">
                                        {row.reviews[row.reviews.length - 1].rating}
                                    </span>
                                    <div className="relative">
                                        <FaStar className="text-gray-300 dark:text-white text-sm" />
                                        <FaStar 
                                            className="text-[#FDB022] absolute top-0 left-0 text-sm" 
                                            style={{ 
                                                clipPath: `inset(0 ${100 - (row.reviews[row.reviews.length - 1].rating / 5) * 100}% 0 0)` 
                                            }} 
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-sm font-medium text-gray-500 dark:text-white">
                            No reviews yet
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'lastVisit',
            label: 'Last Visit',
            render: (row) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {row.lastVisit ? new Date(row.lastVisit).toLocaleDateString('en-GB') : t.noDataAvailable}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {row.user?.businessName || t.noDataAvailable}
                    </div>
                </div>
            )
        },
        {
            key: 'lastPayment',
            label: 'Last Payment',
            render: (row) => <span className="text-sm font-medium text-gray-900 dark:text-white">{row.appointmentCount || 0}</span>
        },
        {
            key: 'totalPaid',
            label: 'Total Paid',
            render: (row) => <span className="text-sm font-medium text-gray-900 dark:text-white">{row.appointmentCount || 0}</span>
        }
    ];

    return (
        <div className="bg-white dark:bg-customBrown p-6 rounded-2xl dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customers ({filteredData.length})</h2>
                <div className="flex items-center">
                    <select
                        value={filterValue}
                        onChange={(e) => {
                            setFilterValue(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-gray-50 dark:bg-[#232323] text-gray-700 dark:text-white px-4 py-2.5 rounded-xl text-sm border-2 border-gray-200 dark:border-customBorderColor hover:border-pink-500 dark:hover:border-pink-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200 min-w-[180px]"
                    >
                        {filterOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>
            <CommonTable
                columns={columns}
                data={paginatedData}
                total={filteredData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                renderActions={(row) => (
                    <div className="flex gap-2">
                        <CommonOutlineButton
                            text={t.view}
                            onClick={() => {
                                setSelectedCustomer(row);
                                setShowViewModal(true);
                            }}
                            className="!text-sm !pt-1.8 !pb-1 !px-4 w-auto rounded-lg"
                        />
                        <CommonOutlineButton
                            text={sendingRating === row.id ? "Sending..." : "WhatsApp"}
                            onClick={() => handleWhatsAppClick(row)}
                            disabled={sendingRating === row.id}
                            icon={<PiChatsCircleBold />}
                            iconClassName="mb-1"
                            className="!text-sm !pt-1.8 !pb-1 !px-4 w-auto rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        />
                    </div>
                )}
            />

            {/* Customer View Modal */}
            {showViewModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-customBrown border border-customBorderColor rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">{t.customerDetails}</h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-purple-400 hover:text-white transition-colors"
                            >
                                {t.close}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Customer Information Section */}
                            <div className="bg-customBlack p-6 rounded-lg">
                                <h4 className="text-white text-lg font-semibold mb-4">{t.customerInformation}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="dark:text-white text-sm">{t.firstName}</p>
                                        <p className="text-white">{selectedCustomer.firstName}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.lastName}</p>
                                        <p className="text-white">{selectedCustomer.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.email}</p>
                                        <p className="text-white">{selectedCustomer.customerEmail || t.noDataAvailable}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.phoneNumber}</p>
                                        <p className="text-white">{selectedCustomer.customerPhone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Information Section */}
                            <div className="bg-customBlack p-6 rounded-lg">
                                <h4 className="text-white text-lg font-semibold mb-4">{t.businessInformation}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="dark:text-white text-sm">{t.businessName}</p>
                                        <p className="text-white">{selectedCustomer.user?.businessName || t.noDataAvailable}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.businessType}</p>
                                        <p className="text-white">{selectedCustomer.user?.businessType || t.noDataAvailable}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.appointmentCount}</p>
                                        <p className="text-white">{selectedCustomer.appointmentCount || 0}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.duration}</p>
                                        <p className="text-white">{selectedCustomer.duration || t.noDataAvailable}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Review Statistics Section */}
                            {selectedCustomer.reviewStatistics && (
                                <div className="bg-customBlack p-6 rounded-lg">
                                    <h4 className="text-white text-lg font-semibold mb-4">Review Statistics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="dark:text-white text-sm">Average Rating</p>
                                            <div className="flex items-center gap-2">
                                                <RatingStars rating={selectedCustomer.reviewStatistics.averageRating} />
                                                <span className="text-white">{selectedCustomer.reviewStatistics.averageRating.toFixed(1)}/5</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="dark:text-white text-sm">Total Reviews</p>
                                            <p className="text-white">{selectedCustomer.reviewStatistics.totalReviews}</p>
                                        </div>
                                        <div>
                                            <p className="dark:text-white text-sm">Highest Rating</p>
                                            <p className="text-white">{selectedCustomer.reviewStatistics.maxRating}/5</p>
                                        </div>
                                        <div>
                                            <p className="dark:text-white text-sm">Lowest Rating</p>
                                            <p className="text-white">{selectedCustomer.reviewStatistics.minRating}/5</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Customer Details Section */}
                            <div className="bg-customBlack p-6 rounded-lg">
                                <h4 className="text-white text-lg font-semibold mb-4">{t.customerDetailsSection}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="dark:text-white text-sm">{t.customerId}</p>
                                        <p className="text-white">{selectedCustomer.id}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.userId}</p>
                                        <p className="text-white">{selectedCustomer.userId}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.selectedServices}</p>
                                        <p className="text-white">{selectedCustomer.selectedServices || t.noDataAvailable}</p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.startDate}</p>
                                        <p className="text-white">
                                            {selectedCustomer.startDate ? new Date(selectedCustomer.startDate).toLocaleDateString('en-GB') : t.noDataAvailable}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.endDate}</p>
                                        <p className="text-white">
                                            {selectedCustomer.endDate ? new Date(selectedCustomer.endDate).toLocaleDateString('en-GB') : t.noDataAvailable}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="dark:text-white text-sm">{t.createdAt}</p>
                                        <p className="text-white">
                                            {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString('en-GB') : t.noDataAvailable}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <CommonConfirmModel
                isOpen={showConfirmModal}
                onClose={handleCloseConfirmModal}
                onConfirm={handleSendRatingRequest}
                title="Send Rating Request"
                message={`Are you sure you want to send a rating request to ${customerToSendRating?.customerFullName || customerToSendRating?.firstName || 'this customer'}?`}
                confirmText="Send"
                cancelText="Cancel"
            />
        </div>
    )
}

export default CustomerTable;
