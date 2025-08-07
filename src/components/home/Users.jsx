import React, { useState } from 'react';
import { HiDotsHorizontal } from 'react-icons/hi';
import userData from '../../jsonData/userData.json';
import { CommonTable } from '../index';

const statusColors = {
    Active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    Inactive: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
};

const statusOptions = ['All', 'Active', 'Inactive'];

function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);
    const [statusFilter, setStatusFilter] = useState('All');
    const [openAction, setOpenAction] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const columns = [
        {
            key: 'name',
            label: 'Name',
            className: 'min-w-[180px]',
            sortable: true,
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
            sortable: true,
            render: (row) => (
                <a href={`mailto:${row.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {row.email}
                </a>
            )
        },
        {
            key: 'phone',
            label: 'Phone',
            className: 'min-w-[150px]',
            sortable: true
        },
        {
            key: 'role',
            label: 'Role',
            className: 'min-w-[120px]',
            sortable: true,
            render: (row) => (
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {row.role}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            className: 'min-w-[120px]',
            sortable: true,
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
                    {row.status}
                </span>
            )
        },
        {
            key: 'businessType',
            label: 'Business Type',
            className: 'min-w-[150px]',
            sortable: true
        },
        {
            key: 'businessName',
            label: 'Business Name',
            className: 'min-w-[180px]',
            sortable: true
        },
        {
            key: 'joiningDate',
            label: 'Joining Date',
            className: 'min-w-[130px]',
            sortable: true,
            render: (row) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {row.joiningDate}
                </span>
            )
        },
        {
            key: 'plan',
            label: 'Plan',
            className: 'min-w-[100px]',
            sortable: true,
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.plan === 'Premium'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                        : row.plan === 'Standard'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                    }`}>
                    {row.plan}
                </span>
            )
        },
        {
            key: 'expireDate',
            label: 'Expire Date',
            className: 'min-w-[130px]',
            sortable: true,
            render: (row) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {row.expireDate}
                </span>
            )
        }
    ];

    // Filter and sort data
    const filteredAndSortedData = React.useMemo(() => {
        return userData.users
            .filter(user => {
                const matchesSearch = Object.values(user).some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
                const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (!sortConfig.key) return 0;
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
    }, [searchTerm, statusFilter, sortConfig]);

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    const renderActions = (row, idx) => (
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
                        onClick={() => { setOpenAction(null); }}
                    >
                        Edit User
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => { setOpenAction(null); }}
                    >
                        Delete User
                    </button>
                </div>
            )}
        </div>
    );

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

    return (
        <div className="bg-white dark:bg-customBrown rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Users Management
                        </h2>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                            {filteredAndSortedData.length} Total
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="px-4 py-2 bg-customViolet text-white rounded-lg hover:bg-customViolet/90 transition-colors"
                        >
                            Add New User
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-auto">
                <CommonTable
                    columns={columns}
                    data={filteredAndSortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    total={filteredAndSortedData.length}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterValue={statusFilter}
                    filterOptions={statusOptions}
                    onFilterChange={setStatusFilter}
                    loading={false}
                    renderActions={renderActions}
                    onSort={handleSort}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    className="p-0 dark:text-white dark:bg-customBrown"
                    noDataComponent={
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No users found
                        </div>
                    }
                />
            </div>
        </div>
    );
}

export default Users;
