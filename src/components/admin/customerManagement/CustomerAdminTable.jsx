import React, { useState, useMemo } from 'react';
import { FaStar } from 'react-icons/fa';
import CommonOutlineButton from '../../commonComponent/CommonOutlineButton';
import CommonTable from '../../commonComponent/CommonTable';
import { PiChatsCircleBold } from 'react-icons/pi';
import CommonButton from '../../commonComponent/CommonButton';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block text-center";
    let colorClasses = "";

    switch (status) {
        case 'Active':
            colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            break;
        case 'At Risk':
            colorClasses = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            break;
        case 'Lost':
            colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            break;
        case 'Recovered':
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
            {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="text-yellow-400" />)}
            {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600" />)}
        </div>
    );
};

function CustomerAdminTable({ customers = [], loading = false }) {
    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState('All Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const filterOptions = ['All Status', ...new Set(customers.map(c => c.status))];

    const filteredData = useMemo(() => {
        let data = customers;

        if (filterValue && filterValue !== 'All Status') {
            data = data.filter(item => item.status === filterValue);
        }

        if (searchValue) {
            const lowercasedValue = searchValue.toLowerCase();
            data = data.filter(item =>
                item.id.toLowerCase().includes(lowercasedValue) ||
                item.customer.firstName.toLowerCase().includes(lowercasedValue) ||
                item.customer.lastName.toLowerCase().includes(lowercasedValue) ||
                item.customer.email.toLowerCase().includes(lowercasedValue) ||
                item.customer.phoneNumber.toLowerCase().includes(lowercasedValue)
            );
        }

        return data;
    }, [customers, searchValue, filterValue]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end);
    }, [currentPage, pageSize, filteredData]);

    const columns = [
        { key: 'id', label: 'User ID', className: 'text-sm text-gray-900 dark:text-white' },
        {
            key: 'customer',
            label: 'Customer',
            render: (row) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                        {row.customer.firstName} {row.customer.lastName}
                    </div>
                    <div className="text-black dark:text-white">{row.customer.email}</div>
                    <div className="text-black dark:text-white">{row.customer.phoneNumber}</div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (row) => (
                <div>
                    <div className="flex items-center gap-1">
                        <RatingStars rating={row.rating || 0} />
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                            {(row.rating || 0).toFixed(1)}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'lastVisit',
            label: 'Last Visit',
            render: (row) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {row.lastVisit ? new Date(row.lastVisit).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {row.totalVisits || 0} visits
                    </div>
                </div>
            )
        },
        {
            key: 'lastPayment',
            label: 'Last Payment',
            render: (row) => <span className="text-sm font-medium text-gray-900 dark:text-white">${(row.lastPayment || 0).toLocaleString()}</span>
        },
        {
            key: 'totalPaid',
            label: 'Total Paid',
            render: (row) => <span className="text-sm font-medium text-gray-900 dark:text-white">${(row.totalPaid || 0).toLocaleString()}</span>
        }
    ];

    return (
        <div className="bg-white dark:bg-customBrown p-6 rounded-2xl dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customers ({filteredData.length})</h2>
            </div>
            <CommonTable
                columns={columns}
                data={paginatedData}
                total={filteredData.length}
                filterValue={filterValue}
                onFilterChange={(value) => {
                    setFilterValue(value);
                    setCurrentPage(1);
                }}
                filterOptions={filterOptions}
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
                            text="View"
                            onClick={() => {
                                setSelectedCustomer(row);
                                setShowViewModal(true);
                            }}
                            className="!text-sm !pt-1.8 !pb-1 !px-4 w-auto rounded-lg"
                        />
                    </div>
                )}
            />

            {/* Customer View Modal */}
            {showViewModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-customBrown border border-customBorderColor rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Customer Details</h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-purple-400 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Customer Information Section */}
                            <div className="bg-customBlack p-6 rounded-lg">
                                <h4 className="text-white text-lg font-semibold mb-4">Customer Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">First Name</p>
                                        <p className="text-white">{selectedCustomer.customer.firstName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Last Name</p>
                                        <p className="text-white">{selectedCustomer.customer.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Email</p>
                                        <p className="text-white">{selectedCustomer.customer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Phone Number</p>
                                        <p className="text-white">{selectedCustomer.customer.phoneNumber}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Information Section */}
                            <div className="bg-customBlack p-6 rounded-lg">
                                <h4 className="text-white text-lg font-semibold mb-4">Business Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Business Name</p>
                                        <p className="text-white">{selectedCustomer.customer.businessName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Business Type</p>
                                        <p className="text-white">{selectedCustomer.customer.businessType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Address</p>
                                        <p className="text-white">{selectedCustomer.customer.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">WhatsApp Number</p>
                                        <p className="text-white">{selectedCustomer.customer.whatsappNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details Section */}
                            <div className="bg-customBlack p-6 rounded-lg">
                                <h4 className="text-white text-lg font-semibold mb-4">Customer Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Customer ID</p>
                                        <p className="text-white">{selectedCustomer.customerId}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Status</p>
                                        <StatusBadge status={selectedCustomer.status} />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Rating</p>
                                        <div className="flex items-center gap-2">
                                            <RatingStars rating={selectedCustomer.rating || 0} />
                                            <span className="text-white">{(selectedCustomer.rating || 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Visits</p>
                                        <p className="text-white">{selectedCustomer.totalVisits || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Last Payment</p>
                                        <p className="text-white">${(selectedCustomer.lastPayment || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Paid</p>
                                        <p className="text-white">${(selectedCustomer.totalPaid || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-400 text-sm">Notes</p>
                                        <p className="text-white">{selectedCustomer.notes || 'No notes available'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerAdminTable;
