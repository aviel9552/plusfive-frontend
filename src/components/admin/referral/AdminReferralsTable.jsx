import React, { useState } from 'react'
import { CommonTable } from '../../index'
import reportData from '../../../jsonData/ReportData.json'
import { HiDotsHorizontal } from 'react-icons/hi'

function AdminReferralsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openAction, setOpenAction] = useState(null);

  // Filter and sort data
  const filteredAndSortedData = React.useMemo(() => {
    return reportData.referrals
      .filter(row => {
        const matchesSearch =
          row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.id.includes(searchTerm);

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

  const columns = [
    {
      key: 'id',
      label: 'No.',
      className: 'text-left font-medium w-16 dark:text-white'
    },
    {
      key: 'name',
      label: 'Name',
      className: 'text-left min-w-[200px]',
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
      className: 'text-left min-w-[200px]',
      render: (row) => (
        <a href={`mailto:${row.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
          {row.email}
        </a>
      )
    },
    {
      key: 'date',
      label: 'Date',
      className: 'text-left min-w-[100px]',
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
        <span className={`px-3 py-1 rounded-full text-sm ${
          row.status === 'Active' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
        }`}>
          {row.status}
        </span>
      )
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
  ];

  return (
    <div className="w-full mt-10">
      <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl dark:hover:bg-customBlack shadow-md hover:shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl text-gray-900 dark:text-white">
                Referrals
              </h2>
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                {filteredAndSortedData.length} Total
              </span>
            </div>
          </div>
          
          <CommonTable 
            data={currentPageData}
            columns={columns}
            className="w-full"
            total={filteredAndSortedData.length}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={statusFilter}
            filterOptions={['All', 'Active', 'Pending']}
            onFilterChange={setStatusFilter}
            onSort={handleSort}
            loading={false}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            noDataComponent={
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No referrals found
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
}

export default AdminReferralsTable