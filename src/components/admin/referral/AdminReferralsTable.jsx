import React, { useState, useEffect } from 'react'
import { CommonTable } from '../../index'
import { HiDotsHorizontal } from 'react-icons/hi'
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminReferralTranslations } from '../../../utils/translations';
import { useDispatch } from 'react-redux';
import { fetchAllReferrals } from '../../../redux/actions/referralActions';
import { useSelector } from 'react-redux';

function AdminReferralsTable() {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const t = getAdminReferralTranslations(language);
  const dispatch = useDispatch();

  // Helper function to format date in DD MM YYYY format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2); // Get only last 2 digits
    return `${day}/${month}/${year}`;
  };

  // Get referrals from Redux state
  const { allReferrals, loading } = useSelector(state => state.referral);

  // Fetch referrals on component mount
  useEffect(() => {
    dispatch(fetchAllReferrals());
  }, [dispatch]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openAction, setOpenAction] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter and sort data
  const filteredAndSortedData = React.useMemo(() => {
    if (!allReferrals || allReferrals.length === 0) return [];

    return allReferrals
      .filter(row => {
        const matchesSearch =
          row.referredFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.referredEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.id?.includes(searchTerm);

        const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortDir === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [allReferrals, searchTerm, statusFilter, sortBy, sortDir]);

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
      label: t.no,
      className: `${isRTL ? 'text-right' : 'text-left'} font-medium w-16 dark:text-white`
    },
    {
      key: 'name',
      label: t.name,
      className: 'text-left min-w-[200px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {row.referredFirstName?.charAt(0)}
          </div> */}
          <span className="font-medium text-black dark:text-white">
            {row.referredFirstName} {row.referredLastName}
          </span>
        </div>
      )
    },
    {
      key: 'email',
      label: t.email,
      className: `${isRTL ? 'text-right' : 'text-left'} min-w-[200px]`,
      render: (row) => (
        <a href={`mailto:${row.referredEmail}`} className="hover:underline text-black dark:text-white">
          {row.referredEmail}
        </a>
      )
    },
    {
      key: 'date',
      label: t.date,
      className: `${isRTL ? 'text-right' : 'text-left'} min-w-[100px]`,
      render: (row) => (
        <span className="text-black dark:text-white">
          {formatDate(row.date)}
        </span>
      )
    },
    {
      key: 'status',
      label: t.status,
      className: 'min-w-[120px]',
      render: (row) => (
        <span className={`px-3 pt-[4px] pb-[5px] rounded-full text-sm ${row.status === 'Active'
            ? 'text-[#2537A5] bg-[#D0E2FF]'
            : 'text-[#EF5A0B] bg-[#FFE8E3]'
          }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'commission',
      label: t.commission,
      className: 'min-w-[120px]',
      render: (row) => (
        <span className="font-medium text-black dark:text-white">
          ₪{row.commission}
        </span>
      )
    },
    {
      key: 'action',
      label: t.action,
      className: 'w-20',
      render: (row, idx) => (
        <div className="text-center relative action-dropdown">
          <button
            className="p-2 rounded-lg text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setOpenAction(openAction === idx ? null : idx)}
          >
            <HiDotsHorizontal className="w-5 h-5" />
          </button>
          {openAction === idx && (
            <div className={`absolute ${isRTL ? 'left-12' : 'right-12'} -top-5 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-customBorderColor rounded-lg shadow-lg z-20 py-1`}>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setOpenAction(null);
                  setSelectedReferral(row);
                  setShowModal(true);
                }}
              >
                {t.viewDetails}
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
              <h2 className="text-20 text-black dark:text-white">
                {t.referrals}
              </h2>
              {/* <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                {filteredAndSortedData.length} {t.total}
              </span> */}
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
                {t.noReferralsFound}
              </div>
            }
          />
        </div>
      </div>

      {/* Referral Details Modal */}
      {showModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black dark:text-white">{t.referralDetails}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-white transition-colors"
              >
                {t.close}
              </button>
            </div>

            <div className="space-y-6">
              {/* Referred User Section */}
              <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-lg">
                <h4 className="text-black dark:text-white text-lg font-semibold mb-4">{t.referredUser}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.firstName}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referredFirstName}</p>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.lastName}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referredLastName}</p>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.email}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referredEmail}</p>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.userId}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referredUserId}</p>
                  </div>
                </div>
              </div>

              {/* Referrer Section */}
              <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-lg">
                <h4 className="text-black dark:text-white text-lg font-semibold mb-4">{t.referrer}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.firstName}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referrerFirstName}</p>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.lastName}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referrerLastName}</p>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.email}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referrerEmail}</p>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.referrerId}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referrerId}</p>
                  </div>
                </div>
              </div>

              {/* Referral Details Section */}
              <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-lg">
                <h4 className="text-black dark:text-white text-lg font-semibold mb-4">{t.referralDetails}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.referralCode}</p>
                    <p className="text-black dark:text-white">{selectedReferral.id}</p>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.referrerCode}</p>
                    <p className="text-black dark:text-white">{selectedReferral.referrerCode}</p>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.status}</p>
                    <span className={`px-3 pt-[4px] pb-[5px] rounded-full text-sm ${selectedReferral.status === 'Active'
                        ? 'text-[#2537A5] bg-[#D0E2FF]'
                        : 'text-[#EF5A0B] bg-[#FFE8E3]'
                      }`}>
                      {selectedReferral.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-black dark:text-white text-sm">{t.commission}</p>
                    <p className="text-black dark:text-white">₪{selectedReferral.commission}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-black dark:text-white text-sm">{t.date}</p>
                    <p className="text-black dark:text-white">
                      {formatDate(selectedReferral.date)}
                    </p>
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

export default AdminReferralsTable