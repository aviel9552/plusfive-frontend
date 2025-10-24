import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CommonNormalDropDown from '../commonComponent/CommonNormalDropDown';
import CommonLoader from '../commonComponent/CommonLoader';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 p-1 text-xs font-semibold rounded-full inline-block text-center text-14 whitespace-nowrap";
    let colorClasses = "";

    // Convert status to lowercase for case-insensitive matching
    const statusLower = status?.toLowerCase();

    switch (statusLower) {
        case 'active':
        case 'פעיל':
            colorClasses = 'text-[#2537A5] bg-[#D0E2FF]';
            break;
        case 'at risk':
        case 'risk':
        case 'at_risk':
        case 'בסיכון':
            colorClasses = 'text-[#AD3D02] bg-[#FFE8E3]';
            break;
        case 'lost':
        case 'אבוד':
            colorClasses = 'text-[#55160C] bg-[#FDA29B]';
            break;
        case 'recovered':
        case 'התאושש':
            colorClasses = 'text-[#2C1C5F] bg-[#E9D7FE]';
            break;
        case 'new':
        case 'חדש':
            colorClasses = 'text-[#2C1C5F] bg-[#E9D7FE]';
            break;
        default:
            colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }

    // Special formatting for status text
    const formatStatusText = (statusText) => {
        if (!statusText) return '';

        const statusLower = statusText.toLowerCase();

        if (statusLower === 'at risk' || statusLower === 'risk' || statusLower === 'at_risk') {
            return 'At Risk';
        }

        return statusText?.charAt(0).toUpperCase() + statusText?.slice(1).toLowerCase();
    };

    return <span className={`${baseClasses} ${colorClasses}`}>{formatStatusText(status)}</span>;
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

function CustomerTable({ customers = [], loading = false, showFilter = true, showText = false, showCount = true }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = getUserCustomerTranslations(language);

    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState(t.allStatus);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);
    const [sendingRating, setSendingRating] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [customerToSendRating, setCustomerToSendRating] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(false);

    const filterOptions = [
        { value: t.allStatus, label: t.allStatus },
        { value: 'New', label: 'New' },
        { value: 'Active', label: 'Active' },
        { value: 'At Risk', label: 'At Risk' },
        { value: 'Lost', label: 'Lost' },
        { value: 'Recovered', label: 'Recovered' }
    ];

    const filteredData = useMemo(() => {
        let data = customers;

        if (filterValue && filterValue !== t.allStatus) {
            data = data.filter(item => {
                const itemStatus = item.customerStatus || item.status;
                if (!itemStatus) return false;

                const itemStatusLower = itemStatus.toLowerCase();

                switch (filterValue) {
                    case 'Active':
                        return itemStatusLower === 'active' || itemStatusLower === 'פעיל';
                    case 'New':
                        return itemStatusLower === 'new' || itemStatusLower === 'חדש';
                    case 'At Risk':
                        return itemStatusLower === 'at risk' || itemStatusLower === 'risk' || itemStatusLower === 'at_risk' || itemStatusLower === 'בסיכון';
                    case 'Lost':
                        return itemStatusLower === 'lost' || itemStatusLower === 'אבוד';
                    case 'Recovered':
                        return itemStatusLower === 'recovered' || itemStatusLower === 'התאושש';
                    default:
                        return true;
                }
            });
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

        // Sort by Last Visit date (newest first) - Create new array to avoid mutation
        const sortedData = [...data].sort((a, b) => {
            const dateA = a.lastVisit ? new Date(a.lastVisit) : new Date(0); // Use epoch for null dates
            const dateB = b.lastVisit ? new Date(b.lastVisit) : new Date(0);
            
            // Sort newest first (descending order)
            return dateB - dateA;
        });

        return sortedData;
    }, [customers, searchValue, filterValue]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end);
    }, [currentPage, pageSize, filteredData]);

    // Show confirmation modal before sending rating request
    const handleWhatsAppClick = (customer) => {

        if (customer?.customerPhone) {
            // Format phone number for WhatsApp (remove + and add country code)
            const phoneNumber = customer.customerPhone.replace('+', '');

            // Create WhatsApp URL
            const whatsappURL = `https://wa.me/${phoneNumber}`;

            // Open WhatsApp in new tab
            window.open(whatsappURL, '_blank');
        } else {
            console.error('Customer phone number not available');
        }
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

            const result = await reviewService.sendRatingViaWhatsApp(requestData);

            if (result.success) {
                toast.success(`${t.ratingRequestSentSuccessfully} ${customerToSendRating.customerFullName || customerToSendRating.firstName}!`);
            } else {
                toast.error(result.error || t.failedToSendRatingRequest);
            }
        } catch (error) {
            console.error('Rating request error:', error);
            toast.error(t.errorOccurredWhileSending);
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
            key: 'index',
            label: 'S.No',
            className: 'text-sm text-gray-900 dark:text-white',
            render: (row, index) => <span className="text-sm text-gray-900 dark:text-white">{(currentPage - 1) * pageSize + index + 1}</span>
        },
        {
            key: 'customer',
            label: t.customer,
            render: (row) => (
                <div className="flex flex-col gap-3">
                    <div className="font-semibold text-black dark:text-white text-14 whitespace-nowrap">
                        {row.customerFullName || `${row.firstName} ${row.lastName}`}
                    </div>
                    <div className="text-black dark:text-[#CECFD2] text-12">{row.email}</div>
                    <div className="text-black dark:text-[#CECFD2] text-12">{row.customerPhone}</div>
                </div>
            )
        },
        {
            key: 'status',
            label: t.status,
            render: (row) => (
                <StatusBadge status={row.customerStatus || row.status} />
            )
        },
        {
            key: 'rating',
            label: t.rating,
            render: (row) => (
                <div className="flex flex-col items-start">
                    {row.reviewStatistics?.averageRating ? (
                        <>
                            <div className="flex items-center gap-2">
                                <RatingStars rating={row.reviewStatistics.averageRating} />
                                <span className="dark:text-white text-14">
                                    {row.reviewStatistics.averageRating.toFixed(1)}
                                </span>
                            </div>
                            {row.reviews && row.reviews.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="dark:text-white text-14">{t.last}:</span>
                                    <span className="dark:text-white text-14">
                                        {row.reviews[row.reviews.length - 1].rating}
                                    </span>
                                    <div className="relative">
                                        <FaStar className="text-gray-300 dark:text-white text-14" />
                                        <FaStar
                                            className="text-[#FDB022] absolute top-0 left-0 text-14"
                                            style={{
                                                clipPath: `inset(0 ${100 - (row.reviews[row.reviews.length - 1].rating / 5) * 100}% 0 0)`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-sm text-gray-500 dark:text-white">
                            {t.noReviewsYet}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'lastVisit',
            label: t.lastVisit,
            render: (row) => (
                <div className="flex flex-col gap-3">
                    <div className="text-14 text-gray-900 dark:text-white">
                        {row.lastVisit ? new Date(row.lastVisit).toLocaleDateString('en-GB') : t.noDataAvailable}
                    </div>
                    {/* <div className="text-12 text-black dark:text-[#CECFD2]">
                        {row.user?.businessName || t.noDataAvailable}
                    </div> */}
                </div>
            )
        },
        {
            key: 'lastPayment',
            label: t.lastPayment,
            render: (row) => <span className="text-14 text-gray-900 dark:text-white">₪{row.lastPaymentAmount || 0}</span>
        },
        {
            key: 'totalPaid',
            label: t.totalPaid,
            render: (row) => <span className="text-14 text-gray-900 dark:text-white">₪{row.totalPaidAmount || 0}</span>
        }
    ];

    // Enhanced loading state handling
    if (loading || isDataLoading) {
        return (
            <div className="bg-white dark:bg-customBrown p-[24px] rounded-2xl dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <CommonLoader />
                    {/* <div className="text-14 text-gray-600 dark:text-gray-400 font-ttcommons">
                        {t.loadingCustomers || 'Loading customers...'}
                    </div> */}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-customBrown p-[24px] rounded-2xl dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <div className='flex flex-col gap-[24px]'>
                <div className={`flex ${showText ? 'justify-end' : 'justify-between'} items-center`}>
                    {showCount && (
                        <h2 className="text-[24px] text-gray-900 dark:text-white font-ttcommons">{t.customers} ({filteredData.length})</h2>
                    )}
                    {showFilter && (
                        <div className="flex items-center">
                            <CommonNormalDropDown
                                options={filterOptions}
                                value={filterValue}
                                onChange={(value) => {
                                    setIsDataLoading(true);
                                    setFilterValue(value);
                                    setCurrentPage(1);
                                    // Simulate filtering delay for better UX
                                    setTimeout(() => {
                                        setIsDataLoading(false);
                                    }, 300);
                                }}
                                placeholder={t.allStatus}
                                className="min-w-[180px]"
                                bgColor="bg-gray-50 dark:bg-[#232323]"
                                textColor="text-gray-700 dark:text-white"
                                fontSize="text-sm"
                            />
                        </div>
                    )}
                    {showText && (
                        <h2
                            className="text-[16px] text-[#675dff] text-right cursor-pointer hover:text-[#4f46e5] transition-colors"
                            onClick={() => navigate('/app/customers')}
                        >
                            View All
                        </h2>
                    )}
                </div>
                <CommonTable
                    columns={columns}
                    data={paginatedData}
                    total={filteredData.length}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    showCount={showCount}
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
                                    setIsDataLoading(true);
                                    setTimeout(() => {
                                        navigate(`/app/customers/view/${row.id}`);
                                        setIsDataLoading(false);
                                    }, 200);
                                }}
                                className="!text-sm pt-2 !px-4 w-auto rounded-lg"
                            />
                            <CommonOutlineButton
                                text={sendingRating === row.id ? (
                                    <div className="flex items-center gap-1">
                                        <CommonLoader />
                                        <span>{t.sending}</span>
                                    </div>
                                ) : t.whatsapp}
                                onClick={() => handleWhatsAppClick(row)}
                                disabled={sendingRating === row.id}
                                icon={sendingRating === row.id ? null : <PiChatsCircleBold />}
                                iconClassName="mb-1"
                                className="!text-sm pt-2 !px-4 w-auto rounded-lg"
                            />
                        </div>
                    )}
                />

            </div>

            {/* Confirmation Modal */}
            <CommonConfirmModel
                isOpen={showConfirmModal}
                onClose={handleCloseConfirmModal}
                onConfirm={handleSendRatingRequest}
                title={t.sendRatingRequest}
                message={`${t.areYouSureToSendRating} ${customerToSendRating?.customerFullName || customerToSendRating?.firstName || t.thisCustomer}?`}
                confirmText={t.send}
                cancelText={t.cancel}
            />
        </div>
    )
}

export default CustomerTable;
