import React from 'react';
import { formatDate, formatTime } from '../../utils/dateFormatter';

const PaymentHistoryTab = ({ customer, t }) => {
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Payment Summary */}
            <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">{t.paymentSummary || 'Payment Summary'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-center">
                        <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                            ₪{customer.totalSpent || 0}
                        </p>
                        <p className="text-xs md:text-sm text-black dark:text-white">{t.totalSpent || 'Total Spent'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {customer.paymentHistory?.length || 0}
                        </p>
                        <p className="text-xs md:text-sm text-black dark:text-white">{t.totalTransactions || 'Total Transactions'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                            ₪{customer.paymentHistory?.reduce((sum, payment) => sum + (payment.total || 0), 0) || 0}
                        </p>
                        <p className="text-xs md:text-sm text-black dark:text-white">{t.paymentHistoryTotal || 'Payment History Total'}</p>
                    </div>
                </div>
            </div>

            {/* Payment History List */}
            <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
                    {t.paymentLogs || 'Payment Logs'} ({customer.paymentHistory?.length || 0})
                </h2>
                {customer.paymentHistory && customer.paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                        {customer.paymentHistory.map((payment, index) => (
                            <div key={payment.id || index} className="bg-white dark:bg-customBrown p-4 md:p-6 rounded-lg border dark:border-customBorderColor">
                                {/* Header Row */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                                            <span className="text-green-600 dark:text-green-400 font-bold text-lg">#{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-2xl">
                                                ₪{payment.total || 0}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {formatDate(payment.paymentDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-4 py-2 text-sm font-semibold rounded-full ${payment.status === 'success'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : payment.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                            {payment.status || 'N/A'}
                                        </span>
                                        {payment.paymentDate && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {formatDate(payment.paymentDate)}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {formatTime(payment.paymentDate)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Amount Details */}
                                <div className={`grid gap-6 mb-6 ${payment.revenuePaymentStatus ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">{t.amountWithoutVAT || 'Amount (Without VAT)'}</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            ₪{payment.totalWithoutVAT || 0}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">{t.vatAmount || 'VAT Amount'}</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            ₪{payment.totalVAT || 0}
                                        </p>
                                    </div>
                                    {payment.revenuePaymentStatus && (
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">{t.revenueStatus || 'Revenue Status'}</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {payment.revenuePaymentStatus}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* IDs Section */}
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">{t.paymentId || 'Payment ID'}</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                                                {payment.id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">{t.businessId || 'Business ID'}</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                {payment.businessId}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">💳</div>
                        <p className="text-black dark:text-white text-lg">{t.noPaymentHistory || 'No Payment History'}</p>
                        <p className="text-black dark:text-white text-sm mt-2">{t.noPaymentRecordsYet || 'This customer has no payment records yet.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistoryTab;

