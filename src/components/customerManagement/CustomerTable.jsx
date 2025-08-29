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

function CustomerTable({ customers = [], loading = false }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = getUserCustomerTranslations(language);

    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState(t.allServices);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);
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
        console.log('customer', customer);

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
                console.log('Rating request response:', result.data);
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
            key: 'employeeId',
            label: t.userId,
            className: 'text-sm text-gray-900 dark:text-white',
            render: (row) => <span className="text-sm text-gray-900 dark:text-white">{row.employeeId}</span>
        },
        {
            key: 'customer',
            label: t.customer,
            render: (row) => (
                <div className="flex flex-col gap-3">
                    <div className="font-semibold text-black dark:text-white text-14 whitespace-nowrap">
                        {row.customerFullName || `${row.firstName} ${row.lastName}`}
                    </div>
                    <div className="text-black dark:text-[#CECFD2] text-12">{row.email || t.noDataAvailable}</div>
                    <div className="text-black dark:text-[#CECFD2] text-12">{row.customerPhone || t.noDataAvailable}</div>
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
                                <span className="dark:text-white font-bold text-lg">
                                    {row.reviewStatistics.averageRating.toFixed(1)}
                                </span>
                            </div>
                            {row.reviews && row.reviews.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="dark:text-white text-sm">{t.last}:</span>
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
                    <div className="text-14 font-medium text-gray-900 dark:text-white">
                        {row.lastVisit ? new Date(row.lastVisit).toLocaleDateString('en-GB') : t.noDataAvailable}
                    </div>
                    <div className="text-12 font-medium text-black dark:text-[#CECFD2]">
                        {row.user?.businessName || t.noDataAvailable}
                    </div>
                </div>
            )
        },
        {
            key: 'lastPayment',
            label: t.lastPayment,
            render: (row) => <span className="text-sm font-medium text-gray-900 dark:text-white">${row.appointmentCount || 0}</span>
        },
        {
            key: 'totalPaid',
            label: t.totalPaid,
            render: (row) => <span className="text-sm font-medium text-gray-900 dark:text-white">${row.appointmentCount || 0}</span>
        }
    ];

    return (
        <div className="bg-white dark:bg-customBrown p-[24px] rounded-2xl dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <div className='flex flex-col gap-[24px]'>
                <div className="flex justify-between items-center">
                    <h2 className="text-[24px] text-gray-900 dark:text-white font-ttcommons">{t.customers} ({filteredData.length})</h2>
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
                                onClick={() => navigate(`/app/customers/view/${row.id}`)}
                                className="!text-sm pt-2 !px-4 w-auto rounded-lg"
                            />
                            <CommonOutlineButton
                                text={sendingRating === row.id ? t.sending : t.whatsapp}
                                onClick={() => handleWhatsAppClick(row)}
                                disabled={sendingRating === row.id}
                                icon={<PiChatsCircleBold />}
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
