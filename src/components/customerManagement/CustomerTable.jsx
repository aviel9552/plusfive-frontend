import React, { useState, useMemo } from 'react';
import { FaStar } from 'react-icons/fa';
import allCustomerData from '../../jsonData/CustomerData.json';
import CommonOutlineButton from '../commonComponent/CommonOutlineButton';
import CommonTable from '../commonComponent/CommonTable';
import { PiChatsCircleBold } from 'react-icons/pi';

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

function CustomerTable() {
    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState('All Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);

    const filterOptions = ['All Status', ...new Set(allCustomerData.map(c => c.status))];

    const filteredData = useMemo(() => {
        let data = allCustomerData;

        if (filterValue && filterValue !== 'All Status') {
            data = data.filter(item => item.status === filterValue);
        }

        if (searchValue) {
            const lowercasedValue = searchValue.toLowerCase();
            data = data.filter(item =>
                item.id.toLowerCase().includes(lowercasedValue) ||
                item.customer.name.toLowerCase().includes(lowercasedValue) ||
                item.customer.email.toLowerCase().includes(lowercasedValue) ||
                item.customer.phone.toLowerCase().includes(lowercasedValue)
            );
        }

        return data;
    }, [searchValue, filterValue]);

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
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">{row.customer.name}</div>
                    <div className="text-black dark:text-white">{row.customer.email}</div>
                    <div className="text-black dark:text-white">{row.customer.phone}</div>
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
                        <RatingStars rating={row.rating.current} />
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300 font-semibold">{row.rating.current.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        Last: {row.rating.last.toFixed(1)} <FaStar className="text-yellow-400 w-3 h-3" />
                    </div>
                </div>
            )
        },
        {
            key: 'lastVisit',
            label: 'Last Visit',
            render: (row) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{row.lastVisit.date}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.lastVisit.treatment}</div>
                </div>
            )
        },
        {
            key: 'lastPayment',
            label: 'Last Payment',
            render: (row) => <span className="text-sm font-medium text-gray-900 dark:text-white">${row.lastPayment.toLocaleString()}</span>
        },
        {
            key: 'totalPaid',
            label: 'Total Paid',
            render: (row) => <span className="text-sm font-medium text-gray-900 dark:text-white">${row.totalPaid.toLocaleString()}</span>
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
                    <CommonOutlineButton
                        text="WhatsApp"
                        icon={<PiChatsCircleBold />}
                        onClick={() => alert(`WhatsApp: ${row.customer.phone}`)}
                        className="!text-sm !py-1.5 !px-4 w-auto rounded-lg"
                    />
                )}
            />
        </div>
    )
}

export default CustomerTable;
