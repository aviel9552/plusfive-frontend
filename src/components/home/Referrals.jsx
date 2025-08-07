import React, { useState } from 'react';
import { HiDotsHorizontal } from 'react-icons/hi';
import { CommonTable } from '../index';
import referralData from '../../jsonData/ReferralData.json';

const statusColors = {
    Active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    Inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
};

const statusOptions = ['All', 'Active', 'Pending', 'Inactive'];

const columns = [
    {
        key: 'no',
        label: 'No.',
        className: 'font-medium w-16'
    },
    {
        key: 'name',
        label: 'Name',
        className: 'min-w-[200px]',
        render: (row) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {row.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
            </div>
        )
    },
    {
        key: 'email',
        label: 'Email',
        className: 'min-w-[200px]',
        render: (row) => (
            <a href={`mailto:${row.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {row.email}
            </a>
        )
    },
    {
        key: 'date',
        label: 'Date',
        className: 'min-w-[100px]',
        render: (row) => (
            <span className="text-gray-600 dark:text-gray-400">
                {row.date}
            </span>
        )
    },
    {
        key: 'status',
        label: 'Status',
        className: 'min-w-[120px]',
        render: (row) => (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
                {row.status}
            </span>
        ),
    },
    {
        key: 'commission',
        label: 'Commission',
        className: 'min-w-[120px]',
        render: (row) => (
            <span className="font-medium text-gray-900 dark:text-white">
                {row.commission}
            </span>
        )
    },
];

const PAGE_SIZES = [7, 10, 20, 30, 50];

// Pagination logic with ellipsis
function getPagination(current, total) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l > 2) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
}

function Referrals() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortBy, setSortBy] = useState('no');
    const [sortDir, setSortDir] = useState('asc');
    const [openAction, setOpenAction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter and sort data first
    const filteredAndSortedData = React.useMemo(() => {
        return referralData.referrals
            .filter(row => {
                const matchesSearch =
                    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row.no.includes(searchTerm);

                const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return sortDir === 'asc' ? -1 : 1;
                if (a[sortBy] > b[sortBy]) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [searchTerm, statusFilter, sortBy, sortDir]);

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredAndSortedData.length);
    const currentPageData = filteredAndSortedData.slice(startIndex, endIndex);

    // Reset to first page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter, pageSize]);

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDir('asc');
        }
        setPage(1);
    };

    // Close dropdown on outside click
    React.useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest('.action-dropdown')) {
                setOpenAction(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Pagination numbers with ...
    const paginationNumbers = getPagination(page, Math.ceil(filteredAndSortedData.length / pageSize));

    return (
        <div className={`bg-white dark:bg-customBrown rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200 font-ttcommons dark:hover:bg-customBlack shadow-md hover:shadow-sm`}>
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Admin
                        </h2>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                            {filteredAndSortedData.length} Total
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="#"
                            className="px-4 py-2 font-semibold text-customViolet transition-colors"
                        >
                            View All
                        </a>
                    </div>
                </div>
            </div>

            <div className="overflow-auto">
                <CommonTable
                    columns={[
                        ...columns,
                        {
                            key: 'action',
                            label: 'Action',
                            className: 'w-20',
                            render: (row, idx) => (
                                <div className="text-center relative action-dropdown">
                                    <button
                                        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => setOpenAction(openAction === idx ? null : idx)}
                                    >
                                        <HiDotsHorizontal className="w-5 h-5" />
                                    </button>
                                    {openAction === idx && (
                                        <div className="absolute right-10 -top-10 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-customBorderColor rounded-lg shadow-lg z-20 py-1">
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => { setOpenAction(null); alert('View clicked!'); }}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    ]}
                    data={currentPageData}
                    total={filteredAndSortedData.length}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterValue={statusFilter}
                    filterOptions={statusOptions}
                    onFilterChange={setStatusFilter}
                    onSort={handleSort}
                    loading={false}
                    currentPage={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    className="p-0 dark:text-white dark:bg-customBrown"
                    noDataComponent={
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No referrals found
                        </div>
                    }
                />
            </div>
        </div>
    );
}

export default Referrals;
