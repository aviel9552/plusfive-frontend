import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchQRCodes, createQRCodeAction, deleteQRCode } from '../../../redux/actions/qrActions';
import CommonAdminTable from '../../../components/commonComponent/CommonAdminTable';
import CommonPagination from '../../../components/commonComponent/CommonPagination';
import CommonButton from '../../../components/commonComponent/CommonButton';
import CommonOutlineButton from '../../../components/commonComponent/CommonOutlineButton';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminQRTranslations } from '../../../utils/translations';
import { getQRCodeByCode } from '../../../redux/services/qrServices';
import { toast } from 'react-toastify';
import {
  MdQrCode2,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdSort,
  MdViewList,
  MdGridView,
  MdClose,
  MdTrendingUp,
  MdShare,
  MdVisibility,
  MdCalendarToday,
  MdCheckCircle,
  MdCancel,
  MdAnalytics,
  MdDownload,
  MdRefresh
} from 'react-icons/md';
import { FiExternalLink, FiCopy } from 'react-icons/fi';
import AdminQRManagement from '../qrManagement';

function AdminQRManagementListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const { language } = useLanguage();
  const t = getAdminQRTranslations(language);

  const qrState = useSelector((state) => state.qr);

  // Correctly access the nested qrCodes structure
  const qrCodes = qrState.qrCodes?.qrCodes || qrState.qrCodes || [];
  const pagination = qrState.qrCodes?.pagination || qrState.pagination;
  const { loading, error } = qrState;

  // Local state for search and pagination
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Modal state for QR details
  const [showModal, setShowModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [qrDetails, setQrDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filtering and sorting with useMemo for performance
  const processedQRCodes = useMemo(() => {
    let filtered = qrCodes.filter(qr => {
      // Search filter
      if (searchValue && searchValue.trim() !== '') {
    const searchLower = searchValue.toLowerCase().trim();
    const nameMatch = qr.name?.toLowerCase().includes(searchLower) || false;
    const urlMatch = qr.url?.toLowerCase().includes(searchLower) || false;
    const qrDataMatch = (qr.qrData || qr.qrdata)?.toLowerCase().includes(searchLower) || false;
    const scanCountMatch = qr.scanCount?.toString().includes(searchLower) || false;

    let ownerNameMatch = false;
    let ownerEmailMatch = false;

    if (qr.user) {
      const firstName = qr.user.firstName?.toLowerCase() || '';
      const lastName = qr.user.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const email = qr.user.email?.toLowerCase() || '';

      ownerNameMatch = fullName.includes(searchLower) || firstName.includes(searchLower) || lastName.includes(searchLower);
      ownerEmailMatch = email.includes(searchLower);
    }

        if (!(nameMatch || urlMatch || qrDataMatch || scanCountMatch || ownerNameMatch || ownerEmailMatch)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const isActive = qr.isActive === true || qr.isActive === 'true';
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const createdDate = new Date(qr.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'year':
            if (daysDiff > 365) return false;
            break;
        }
      }

      return true;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'scanCount':
          aValue = a.scanCount || 0;
          bValue = b.scanCount || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [qrCodes, searchValue, statusFilter, dateFilter, sortBy, sortOrder]);

  const filteredQRCodes = processedQRCodes;

  // Calculate pagination for filtered results
  const totalItems = filteredQRCodes.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedQRCodes = filteredQRCodes.slice(startIndex, endIndex);

  useEffect(() => {
    // Fetch all QR codes when component mounts
    const loadQRCodes = async () => {

      const result = await dispatch(fetchQRCodes());

    };

    loadQRCodes();
  }, [dispatch]);

  // Handle create QR code - redirect to qr-management page
  const handleCreateQR = () => {
    navigate('/admin/qr-management');
  };
  // Handle create QR code - redirect to qr-management page
  const handleMyQRCodes = () => {
    navigate('/admin/qr-management/my-codes');
  };

  // Handle delete QR code
  const handleDeleteQR = async (qr) => {
    const result = await dispatch(deleteQRCode(qr.id));
  };

  // Handle edit QR code
  const handleEditQR = (qr) => {
    // Add edit functionality here
  };

  // Handle view QR code details
  const handleViewQR = async (qr) => {
    setSelectedQR(qr);
    setShowModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await getQRCodeByCode(qr.qrData);
      if (response && response.data) {
        setQrDetails(response.data);
      } else {
        toast.error('Failed to load QR Code details');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load QR Code details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Here you can add API call to fetch data for specific page
    // dispatch(fetchQRCodes({ page: newPage, limit: pageSize }));
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
    // Here you can add API call to fetch data with new page size
    // dispatch(fetchQRCodes({ page: 1, limit: newPageSize }));
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQR(null);
    setQrDetails(null);
  };

  // Handle refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchQRCodes());
      toast.success('QR Codes refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh QR Codes');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle copy QR data
  const handleCopyQRData = async (qrData) => {
    try {
      await navigator.clipboard.writeText(qrData);
      toast.success('QR data copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy QR data');
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchValue('');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Enhanced table columns with professional styling
  const columns = [
    {
      key: 'qrPreview',
      label: 'QR Code',
      render: (qr) => (
        <div className="flex items-center space-x-3">
          <div className="relative">
            {qr.qrCodeImage ? (
          <img
            src={qr.qrCodeImage}
            alt={`QR Code for ${qr.name}`}
                className="w-12 h-12 object-contain border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          />
        ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center">
                <MdQrCode2 className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-customBrown ${qr.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {qr.name || 'Unnamed QR'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              ID: {qr.id}
            </div>
          </div>
          </div>
      )
    },
    {
      key: 'qrData',
      label: 'QR Data',
      render: (qr) => (
        <div className="group max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="truncate text-gray-900 dark:text-white font-mono text-sm" title={qr.qrData || qr.qrdata}>
          {qr.qrData || qr.qrdata}
            </div>
            <button
              onClick={() => handleCopyQRData(qr.qrData || qr.qrdata)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
              title="Copy QR data"
            >
              <FiCopy className="w-4 h-4" />
            </button>
          </div>
          {qr.url && (
            <div className="flex items-center space-x-1 mt-1">
              <FiExternalLink className="w-3 h-3 text-gray-400" />
              <a
                href={qr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
              >
                {qr.url}
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (qr) => {
        const user = qr.user;
        if (!user) return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No owner
          </div>
        );

        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const email = user.email || '';

        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-white">
              {fullName || 'N/A'}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              {email}
            </div>
          </div>
        );
      }
    },
    {
      key: 'analytics',
      label: 'Analytics',
      render: (qr) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <MdVisibility className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {qr.scanCount || 0}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">scans</span>
            </div>
            {qr.sharedCount > 0 && (
              <div className="flex items-center space-x-1">
                <MdShare className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {qr.sharedCount}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">shares</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {qr.scanCount > 0 ? (
              <span className="inline-flex items-center space-x-1">
                <MdTrendingUp className="w-3 h-3 text-green-500" />
                <span>Active</span>
              </span>
            ) : (
              <span>No activity</span>
            )}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (qr) => (
        <div className="space-y-1">
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${qr.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
            {qr.isActive ? (
              <>
                <MdCheckCircle className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <MdCancel className="w-3 h-3 mr-1" />
                Inactive
              </>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <MdCalendarToday className="w-3 h-3 mr-1" />
            {new Date(qr.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
      sortable: true
    }
  ];

  // Log Redux state changes
  useEffect(() => {
  }, [qrCodes, pagination, loading, error]);

  return (
    <div className="space-y-6">
      {/* Professional Header Section */}
      <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <MdQrCode2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-20 font-bold text-gray-900 dark:text-white">
                QR Code Management
              </h1>
              <p className="text-12 text-black dark:text-white">
                Manage and monitor all QR codes in the system
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <CommonOutlineButton
              text="Refresh"
              icon={<MdRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-[8px]"
              textClass="text-14 rounded-full"
            />
            <CommonOutlineButton
              text="My QR Codes"
              icon={<MdViewList className="w-4 h-4" />}
              onClick={handleMyQRCodes}
              className="px-4 py-2 rounded-[8px]"
              textClass="whitespace-nowrap text-14"
            />
            {/* <CommonButton
              text="Create QR Code"
              icon={<MdAdd className="w-4 h-4" />}
              onClick={handleCreateQR}
              className="px-6 py-2 whitespace-nowrap rounded-[8px] text-14"
            /> */}
          </div>
        </div>
      </div>

      {/* Create QR Code */}
      <AdminQRManagement />

      {/* Enhanced QR Code Analytics Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-customBrown border border-gray-300 dark:border-customBorderColor rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-customBrown border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <MdAnalytics className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-20 font-bold text-gray-900 dark:text-white">
                    QR Code Analytics Dashboard
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedQR?.name || 'Detailed performance metrics and insights'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CommonOutlineButton
                  text="Export Data"
                  icon={<MdDownload className="w-4 h-4" />}
                  onClick={() => {/* Add export functionality */ }}
                  className="px-4 py-2 text-sm rounded-[8px]"
                />
              <button
                onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                  <MdClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
            {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
                  <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">Loading comprehensive analytics...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please wait while we gather your data</p>
              </div>
            ) : qrDetails ? (
                <div className="space-y-8">
                  {/* QR Code Preview & Quick Actions */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          {selectedQR?.qrCodeImage ? (
                            <img
                              src={selectedQR.qrCodeImage}
                              alt={`QR Code for ${selectedQR.name}`}
                              className="w-24 h-24 object-contain border-4 border-white dark:border-[#FFFFFF1A] rounded-2xl shadow-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-4 border-white dark:border-[#FFFFFF1A] rounded-2xl flex items-center justify-center shadow-lg">
                              <MdQrCode2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-3 border-white dark:border-[#FFFFFF1A] flex items-center justify-center ${qrDetails.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                            {qrDetails.isActive ? (
                              <MdCheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <MdCancel className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {qrDetails.name || 'Unnamed QR Code'}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <MdCalendarToday className="w-4 h-4" />
                              <span>Created {qrDetails.createdAt ? new Date(qrDetails.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MdVisibility className="w-4 h-4" />
                              <span>{qrDetails.scanCount || 0} scans</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${qrDetails.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                              {qrDetails.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {qrDetails.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <CommonOutlineButton
                          text="Copy QR Data"
                          icon={<FiCopy className="w-4 h-4" />}
                          onClick={() => handleCopyQRData(qrDetails.qrData || qrDetails.qrdata)}
                          className="px-4 py-2 text-sm rounded-[8px]"
                        />
                        {qrDetails.url && (
                          <CommonButton
                            text="Visit Target URL"
                            icon={<FiExternalLink className="w-4 h-4" />}
                            onClick={() => window.open(qrDetails.url, '_blank')}
                            className="px-4 py-2 text-sm rounded-[8px]"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Key Performance Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Scans</p>
                          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                            {qrDetails.scanCount || 0}
                          </p>
                          <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                            {qrDetails.scanCount > 0 ? 'Active engagement' : 'No scans yet'}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <MdVisibility className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 dark:text-green-400 text-sm font-medium">Shares</p>
                          <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                            {qrDetails.sharedCount || 0}
                          </p>
                          <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                            {qrDetails.sharedCount > 0 ? 'Viral potential' : 'Not shared yet'}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <MdShare className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Friend Clicks</p>
                          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                            {qrDetails.friendClicks || 0}
                          </p>
                          <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">
                            {qrDetails.friendClicks > 0 ? 'Social engagement' : 'No clicks yet'}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <FiExternalLink className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Chats Back</p>
                          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                            {qrDetails.chatsBack || 0}
                          </p>
                          <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">
                            {qrDetails.chatsBack > 0 ? 'Conversations' : 'No chats yet'}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                          <MdTrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                  </div>
                  </div>
                  </div>

                  {/* QR Code Details & Configuration */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <MdQrCode2 className="w-5 h-5 mr-2" />
                        QR Code Configuration
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">QR Data</p>
                          <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                              {qrDetails.qrData || qrDetails.qrdata || 'N/A'}
                            </p>
                  </div>
                </div>

                        {qrDetails.url && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Target URL</p>
                            <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <a
                                href={qrDetails.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
                              >
                                {qrDetails.url}
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                    <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${qrDetails.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                {qrDetails.isActive ? (
                                  <>
                                    <MdCheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <MdCancel className="w-3 h-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </span>
                            </div>
                    </div>

                    <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                            <p className="text-gray-900 dark:text-white mt-1 text-sm">
                              {qrDetails.createdAt ? new Date(qrDetails.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <MdTrendingUp className="w-5 h-5 mr-2" />
                        Performance Insights
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <MdVisibility className="w-5 h-5 text-white" />
                    </div>
                    <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Scan Performance</p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                {qrDetails.scanCount > 100 ? 'Excellent engagement' :
                                  qrDetails.scanCount > 50 ? 'Good performance' :
                                    qrDetails.scanCount > 10 ? 'Growing steadily' : 'Getting started'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <MdShare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">Share Rate</p>
                              <p className="text-xs text-green-700 dark:text-green-300">
                                {qrDetails.sharedCount > 0 ? `${Math.round((qrDetails.sharedCount / qrDetails.scanCount) * 100)}% of scans resulted in shares` : 'No shares yet'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                              <FiExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div>
                              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Conversion Rate</p>
                              <p className="text-xs text-purple-700 dark:text-purple-300">
                                {qrDetails.friendClicks > 0 ? `${Math.round((qrDetails.friendClicks / qrDetails.scanCount) * 100)}% of scans led to actions` : 'No conversions yet'}
                      </p>
                    </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>

                  {/* Enhanced Scan Details Table */}
                  <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <MdAnalytics className="w-5 h-5 mr-2" />
                        Detailed Scan Analytics
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Total Scans: {qrDetails.scanDetails?.length || 0}</span>
                        {qrDetails.scanDetails?.length > 0 && (
                          <span className="text-green-600 dark:text-green-400">
                            • Last scan: {new Date(Math.max(...qrDetails.scanDetails.map(s => new Date(s.when || 0)))).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {qrDetails.scanDetails && qrDetails.scanDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                        <table className="w-full">
                      <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Scan Details</th>
                              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Location & Device</th>
                              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Timestamp</th>
                              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                            {qrDetails.scanDetails.map((scan, index) => (
                              <tr key={index} className="border-b border-gray-100 dark:border-[#FFFFFF1A] hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      Scan #{scan.id || index + 1}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Referrer: {scan.referrer || 'Direct'}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    <div className="text-sm text-gray-900 dark:text-white font-mono">
                                      {scan.ip || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={scan.userAgent}>
                                      {scan.userAgent || 'N/A'}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {scan.when ? new Date(scan.when).toLocaleString() : 'N/A'}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                      title="Copy IP address"
                                      onClick={() => handleCopyQRData(scan.ip)}
                                    >
                                      <FiCopy className="w-4 h-4" />
                                    </button>
                                    <button
                                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                      title="Copy user agent"
                                      onClick={() => handleCopyQRData(scan.userAgent)}
                                    >
                                      <FiCopy className="w-4 h-4" />
                                    </button>
                                  </div>
                            </td>
                          </tr>
                            ))}
                      </tbody>
                    </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MdAnalytics className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Scan Data Available
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                          This QR code hasn't been scanned yet. Once users start scanning, you'll see detailed analytics here.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Footer */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Ready to optimize your QR code?
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Use these insights to improve engagement and track performance
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <CommonOutlineButton
                          text="Edit QR Code"
                          icon={<MdQrCode2 className="w-4 h-4" />}
                          onClick={() => {/* Add edit functionality */ }}
                          className="px-6 py-3 rounded-[8px]"
                        />
                        <CommonButton
                          text="View Full Analytics"
                          icon={<MdAnalytics className="w-4 h-4" />}
                          onClick={() => {/* Add full analytics view */ }}
                          className="px-6 py-2 rounded-[8px]"
                        />
                      </div>
                  </div>
                </div>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <MdAnalytics className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    Analytics Data Unavailable
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    We couldn't load the analytics data for this QR code. Please try refreshing or contact support if the issue persists.
                  </p>
                  <div className="mt-6">
                    <CommonOutlineButton
                      text="Try Again"
                      onClick={() => handleViewQR(selectedQR)}
                      className="px-6 py-3"
                    />
                  </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters and Search Section */}
      {/* <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
        </div>
          <input
            type="text"
              placeholder="Search QR codes, owners, or data..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-customBlack text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium transition-all duration-200 ${showFilters || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600'
                  : 'bg-white dark:bg-customBlack text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <MdFilterList className="w-4 h-4 mr-2" />
              Filters
              {(statusFilter !== 'all' || dateFilter !== 'all') && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-purple-600 rounded-full">
                  {[statusFilter !== 'all', dateFilter !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSort('scanCount')}
              className={`inline-flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium transition-all duration-200 ${sortBy === 'scanCount'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600'
                  : 'bg-white dark:bg-customBlack text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <MdSort className="w-4 h-4 mr-2" />
              Sort by Scans
              {sortBy === 'scanCount' && (
                <span className="ml-1">
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>

            {(searchValue || statusFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'createdAt') && (
              <CommonOutlineButton
                text="Reset"
                onClick={handleResetFilters}
                className="rounded-[8px]"
                textClass="text-14"
              />
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-customBlack text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-customBlack text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-customBlack text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="name">Name</option>
                  <option value="scanCount">Scan Count</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div> */}

      {/* Results Summary */}
      {/* <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">
                {filteredQRCodes.length}
              </span> of <span className="font-medium text-gray-900 dark:text-white">
                {qrCodes.length}
              </span> QR codes
            </div>
            {filteredQRCodes.length > 0 && (
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MdVisibility className="w-4 h-4 text-blue-500" />
                  <span>
                    {filteredQRCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0)} total scans
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MdCheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    {filteredQRCodes.filter(qr => qr.isActive).length} active
          </span>
        </div>
      </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-customBlack hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {viewMode === 'table' ? (
                <>
                  <MdGridView className="w-4 h-4 mr-2" />
                  Grid View
                </>
              ) : (
                <>
                  <MdViewList className="w-4 h-4 mr-2" />
                  Table View
                </>
              )}
            </button>
          </div>
        </div>
      </div> */}

      {/* Main Content Area */}
      <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading QR codes...</p>
          </div>
        ) : filteredQRCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MdQrCode2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {qrCodes.length === 0 ? 'No QR codes yet' : 'No QR codes match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              {qrCodes.length === 0
                ? 'Create your first QR code to start tracking engagement and analytics.'
                : 'Try adjusting your search terms or filters to find what you\'re looking for.'
              }
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              {qrCodes.length === 0 ? (
                <CommonButton
                  text="Create Your First QR Code"
                  icon={<MdAdd className="w-4 h-4" />}
                  // onClick={handleCreateQR}
                  className="px-6 py-3 rounded-[8px]"
                />
              ) : (
                <CommonOutlineButton
                  text="Reset Filters"
                  onClick={handleResetFilters}
                  className="rounded-[8px]"
                />
              )}
            </div>
          </div>
        ) : (
          <>
        <CommonAdminTable
          columns={columns}
          data={paginatedQRCodes}
          total={totalItems}
          loading={loading}
          renderActions={true}
          onEdit={handleEditQR}
          onView={handleViewQR}
          onDelete={handleDeleteQR}
          currentPage={currentPage}
          pageSize={pageSize}
              showPagination={false}
              showFilterBar={false}
              noDataComponent="No QR codes found"
              loadingComponent="Loading QR codes..."
              className="border-0"
            />

            {/* Enhanced Pagination */}
      {totalItems > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <CommonPagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            showPageSizeSelector={true}
            showPageInfo={true}
          />
        </div>
      )}
          </>
        )}
      </div>

    </div>
  );
}

export default AdminQRManagementListing;