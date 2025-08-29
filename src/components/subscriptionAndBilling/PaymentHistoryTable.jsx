import React, { useState, useMemo, useEffect } from 'react';
import { IoMdDownload } from 'react-icons/io';
import HistoryTable from '../commonComponent/HistoryTable';
import CommonOutlineButton from '../commonComponent/CommonOutlineButton';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';

const PaymentHistoryTable = () => {
    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);
    const { language } = useLanguage();
    const t = getUserCardTranslations(language);
    
    // Get Stripe subscription data
    const { currentSubscription, subscriptionLoading } = useStripeSubscription();

    const filterOptions = ['All', 'Paid', 'Pending', 'Failed'];

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

    const filteredData = useMemo(() => {
        let data = getInvoiceData();
        
        if (filterValue !== 'All') {
            data = data.filter(item => item.status === filterValue.toLowerCase());
        }

        if (searchValue) {
            data = data.filter(item => 
                item.id.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
        return data;
    }, [searchValue, filterValue, currentSubscription]);

    const paginatedAndMappedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginated = filteredData.slice(start, end);

        const getStatusClassName = (status) => {
            switch (status?.toLowerCase()) {
                case 'paid': return 'text-[#675DFF]';
                case 'failed': return 'text-[#D92D20]';
                case 'pending': return 'text-yellow-500';
                case 'open': return 'text-blue-500';
                case 'draft': return 'text-gray-500';
                default: return 'text-gray-500';
            }
        };

        const getStatusBarClassName = (status) => {
            switch (status?.toLowerCase()) {
                case 'paid': return 'bg-gradient-to-r from-[#DF64CC] to-[#FE5D39]';
                case 'failed': return 'bg-red-500';
                case 'pending': return 'bg-yellow-500';
                case 'open': return 'bg-blue-500';
                case 'draft': return 'bg-gray-500';
                default: return 'bg-gray-500';
            }
        };

        const formatDate = (timestamp) => {
            if (!timestamp) return 'N/A';
            return new Date(timestamp * 1000).toLocaleDateString();
        };

        return paginated.map(item => ({
            icon: <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">$</div>,
            title: item.id,
            subtitle: formatDate(item.created),
            value: `$${item.amount.toFixed(2)}`,
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
                        } else {
                            console.log('No invoice URL available for:', item.id);
                        }
                    }}
                    className="!text-sm !py-1.5 !px-4 w-auto rounded-lg"
                    text={item.hostedInvoiceUrl || item.invoicePdf ? 'View' : 'N/A'}
                    icon={<IoMdDownload />}
                />
            )
        }));
    }, [filteredData, currentPage, pageSize, t]);
    
    // Show loading state
    if (subscriptionLoading) {
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

    // Show empty state if no invoices
    if (!currentSubscription?.data?.stripe?.invoices || currentSubscription.data.stripe.invoices.length === 0) {
        return (
            <div className="bg-white dark:bg-customBrown p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
                <h2 className="text-24 font-ttcommons mb-6 text-gray-900 dark:text-white">{t.paymentHistory}</h2>
                <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 text-16">
                        No payment history found.
                        <br />
                        <span className="text-blue-600 dark:text-blue-400">
                            Your payment history will appear here once you have active subscriptions.
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