import React, { useState, useMemo, useEffect } from 'react';
import { IoMdDownload } from 'react-icons/io';
import HistoryTable from '../commonComponent/HistoryTable';
import CommonOutlineButton from '../commonComponent/CommonOutlineButton';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import { getPaymentHistory } from '../../redux/services/simplePaymentServices';

const PaymentHistoryTable = () => {
    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);
    const [paymentHistoryData, setPaymentHistoryData] = useState(null);
    const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(true);
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);
    
    // Get Stripe subscription data
    const { currentSubscription, subscriptionLoading } = useStripeSubscription();

    const filterOptions = ['All', 'Paid', 'Pending', 'Failed'];

    // Fetch payment history on component mount
    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                setPaymentHistoryLoading(true);
                const result = await getPaymentHistory();
                if (result.success) {
                    setPaymentHistoryData(result.data);
                }
            } catch (error) {
                // Silent error handling
            } finally {
                setPaymentHistoryLoading(false);
            }
        };

        fetchPaymentHistory();
    }, []);

    // Extract invoice data from Stripe subscription
    const getInvoiceData = () => {
        if (!currentSubscription?.data?.stripe?.invoices) return [];
        
        return currentSubscription.data.stripe.invoices.map(invoice => ({
            id: invoice.id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency,
            status: invoice.status,
            created: invoice.created,
            hostedInvoiceUrl: invoice.hosted_invoice_url,
            invoicePdf: invoice.invoice_pdf,
            subscription: invoice.subscription
        }));
    };

    // Get payment history data
    const getPaymentHistoryData = () => {
        if (!paymentHistoryData?.payments) return [];
        
        return paymentHistoryData.payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            created: payment.createdAt,
            description: payment.description,
            paymentType: payment.paymentType,
            stripeSessionId: payment.stripeSessionId,
            stripePaymentId: payment.stripePaymentId,
            stripeSubscriptionId: payment.stripeSubscriptionId,
            paymentMethod: payment.paymentMethod,
            source: payment.source,
            metadata: payment.metadata,
            receiptUrl: payment.receiptUrl,
            invoiceUrl: payment.invoiceUrl
        }));
    };

    const filteredData = useMemo(() => {
        // Only show payment history data (not Stripe invoices)
        let data = getPaymentHistoryData();
        
        // Filter to show only "simple" payment type
        data = data.filter(item => item.paymentType === 'simple');
        
        if (filterValue !== 'All') {
            data = data.filter(item => {
                const itemStatus = item.status?.toLowerCase();
                const filterStatus = filterValue.toLowerCase();
                
                // Map filter values to actual status values
                if (filterStatus === 'paid') return itemStatus === 'succeeded';
                if (filterStatus === 'pending') return itemStatus === 'pending';
                if (filterStatus === 'failed') return itemStatus === 'failed';
                return itemStatus === filterStatus;
            });
        }

        if (searchValue) {
            data = data.filter(item => 
                item.id.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
        
        return data;
    }, [searchValue, filterValue, paymentHistoryData]);

    const paginatedAndMappedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginated = filteredData.slice(start, end);

        const getStatusClassName = (status) => {
            switch (status?.toLowerCase()) {
                case 'paid': 
                case 'succeeded': return 'text-[#675DFF]';
                case 'failed': return 'text-[#D92D20]';
                case 'pending': return 'text-yellow-500';
                case 'open': return 'text-blue-500';
                case 'draft': return 'text-gray-500';
                default: return 'text-gray-500';
            }
        };

        const getStatusBarClassName = (status) => {
            switch (status?.toLowerCase()) {
                case 'paid': 
                case 'succeeded': return 'bg-gradient-to-r from-[#DF64CC] to-[#FE5D39]';
                case 'failed': return 'bg-red-500';
                case 'pending': return 'bg-yellow-500';
                case 'open': return 'bg-blue-500';
                case 'draft': return 'bg-gray-500';
                default: return 'bg-gray-500';
            }
        };

        const formatDate = (timestamp) => {
            if (!timestamp) return 'N/A';
            // Handle both Unix timestamp and ISO string
            const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
            return date.toLocaleDateString();
        };

        return paginated.map(item => ({
            icon: <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">₪</div>,
            title: item.id,
            subtitle: formatDate(item.created),
            value: `₪${item.amount.toFixed(2)}`,
            statusInfo: {
                text: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                className: getStatusClassName(item.status),
            },
            action: (
                <CommonOutlineButton
                    onClick={() => {
                        if (item.hostedInvoiceUrl) {
                            window.open(item.hostedInvoiceUrl, '_blank');
                        } else if (item.invoicePdf) {
                            window.open(item.invoicePdf, '_blank');
                        } else if (item.invoiceUrl) {
                            // Use invoice URL from backend
                            window.open(item.invoiceUrl, '_blank');
                        } else if (item.receiptUrl) {
                            // Fallback to receipt URL
                            window.open(item.receiptUrl, '_blank');
                        }
                    }}
                    className="!text-sm !py-1.5 !px-4 w-auto rounded-lg"
                    text={item.hostedInvoiceUrl || item.invoicePdf ? 'View' : (item.invoiceUrl ? 'Invoice' : (item.receiptUrl ? 'Receipt' : 'N/A'))}
                    icon={<IoMdDownload />}
                />
            )
        }));
    }, [filteredData, currentPage, pageSize, t]);
    
    // Show loading state
    if (paymentHistoryLoading) {
        return (
            <div className="bg-white dark:bg-customBrown p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <h2 className="text-24 font-ttcommons mb-6 text-gray-900 dark:text-white">{t.paymentHistory}</h2>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payment history...</span>
                </div>
            </div>
        );
    }

    // Show empty state if no payment history data
    const hasPaymentHistory = paymentHistoryData?.payments && paymentHistoryData.payments.length > 0;
    
    if (!hasPaymentHistory) {
        return (
            <div className="bg-white dark:bg-customBrown p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <h2 className="text-24 font-ttcommons mb-6 text-gray-900 dark:text-white">{t.paymentHistory}</h2>
                <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 text-16">
                        No payment history found.
                        <br />
                        <span className="text-blue-600 dark:text-blue-400">
                            Your payment history will appear here once you have payments.
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-customBrown p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <h2 className="text-24 font-ttcommons mb-[24px] text-gray-900 dark:text-white">{t.paymentHistory}</h2>
            
            <HistoryTable 
                data={paginatedAndMappedData}
                total={filteredData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                filterValue={filterValue}
                filterOptions={filterOptions}
                onFilterChange={setFilterValue}
            />
        </div>
    );
};

export default PaymentHistoryTable; 