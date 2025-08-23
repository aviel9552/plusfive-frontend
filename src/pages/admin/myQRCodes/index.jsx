import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyQRCodes, createQRCodeAction, deleteQRCode } from '../../../redux/actions/qrActions';
import CommonAdminTable from '../../../components/commonComponent/CommonAdminTable';
import CommonPagination from '../../../components/commonComponent/CommonPagination';
import CommonButton from '../../../components/commonComponent/CommonButton';
import CommonOutlineButton from '../../../components/commonComponent/CommonOutlineButton';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminQRTranslations } from '../../../utils/translations';
import { getQRCodeById } from '../../../redux/services/qrServices';
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

function myQRCodes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const { language } = useLanguage();
  const t = getAdminQRTranslations(language);
  const slug = window.location.pathname.split('/')[1];

  const qrState = useSelector((state) => state.qr);

  // Use myQRCodes array from reducer
  const qrCodes = qrState.myQRCodes || [];
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
    // Fetch my QR codes when component mounts
    const loadMyQRCodes = async () => {
      const result = await dispatch(fetchMyQRCodes());
    };

    loadMyQRCodes();
  }, [dispatch, user?.id]);

  // Handle create QR code - redirect to qr-management page
  const handleCreateQR = () => {
    navigate(`/${slug}/qr-management`);
  };
  
  // Handle view all QR codes
  const handleAllQRCodes = () => {
    navigate(`/${slug}/qr-management/listing`);
  };

  // Handle refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchMyQRCodes());
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
      const response = await getQRCodeById(qr.id);
      if (response && response.data) {
        setQrDetails(response.data);
      } else {
        toast.error(t.failedToLoadQRCodeDetails);
      }
    } catch (error) {
      toast.error(error.message || t.failedToLoadQRCodeDetailsTryAgain);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Here you can add API call to fetch data for specific page
    // dispatch(fetchMyQRCodes({ page: newPage, limit: pageSize }));
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
    // Here you can add API call to fetch data with new page size
    // dispatch(fetchMyQRCodes({ page: 1, limit: newPageSize }));
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQR(null);
    setQrDetails(null);
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
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-customBrown ${
              qr.isActive ? 'bg-green-500' : 'bg-gray-400'
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
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            qr.isActive 
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
    <div className="p-4 md:p-6 dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl text-gray-900 dark:text-white">
      {/* QR Code Analytics Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-customBrown border border-gray-300 dark:border-customBorderColor rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.qrCodeAnalytics}</h2>
              <button
                onClick={handleCloseModal}
                className="text-purple-600 dark:text-purple-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <CommonOutlineButton
              text="Refresh"
              icon={<MdRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2"
            />
            {user.role === 'admin' && (
              <CommonOutlineButton
                text="All QR Codes"
                icon={<MdViewList className="w-4 h-4" />}
                onClick={handleAllQRCodes}
                className="px-4 py-2"
              />
            )}
            <CommonButton
              text="Create QR Code"
              icon={<MdAdd className="w-4 h-4" />}
              onClick={handleCreateQR}
              className="px-6 py-2"
            />
          </div>
        </div>
      </div>

            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                <span className="ml-2 text-gray-900 dark:text-white">{t.loadingQRCodeDetails}</span>
              </div>
            ) : qrDetails ? (
              <div className="space-y-6">
                {/* Key Metrics Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-100 dark:bg-customBlack p-4 rounded-lg">
                    <h3 className="text-gray-700 dark:text-white text-sm">{t.chatsBack}</h3>
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">{qrDetails.chatsBack || 0}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-customBlack p-4 rounded-lg">
                    <h3 className="text-gray-700 dark:text-white text-sm">{t.friendClicks}</h3>
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">{qrDetails.friendClicks || 0}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-customBlack p-4 rounded-lg">
                    <h3 className="text-gray-700 dark:text-white text-sm">{t.sharedCount}</h3>
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">{qrDetails.sharedCount || 0}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-customBlack p-4 rounded-lg">
                    <h3 className="text-gray-700 dark:text-white text-sm">{t.totalScans}</h3>
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">{qrDetails.scanCount || 0}</p>
                  </div>
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
                              className="w-24 h-24 object-contain border-4 border-white dark:border-gray-800 rounded-2xl shadow-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-4 border-white dark:border-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                              <MdQrCode2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center ${
                            qrDetails.isActive ? 'bg-green-500' : 'bg-red-500'
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
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              qrDetails.isActive 
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

                {/* QR Code Details */}
                <div className="bg-gray-100 dark:bg-customBlack p-6 rounded-lg">
                  <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">{t.qrCodeInformation}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 dark:text-white text-sm">{t.qrCodeName}</p>
                      <p className="text-gray-900 dark:text-white">{qrDetails.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-white text-sm">{t.qrCodeID}</p>
                      <p className="text-gray-900 dark:text-white">{qrDetails.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-white text-sm">{t.qrData}</p>
                      <p className="text-gray-900 dark:text-white">{qrDetails.qrData || qrDetails.qrdata || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-white text-sm">{t.createdAt}</p>
                      <p className="text-gray-900 dark:text-white">{qrDetails.createdAt ? new Date(qrDetails.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-white text-sm">{t.status}</p>
                      <p className={`${qrDetails.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {/* {qrDetails.isActive ? t.active : t.inactive} */}
                        {qrDetails.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-white text-sm">{t.url}</p>
                      <p className="text-gray-900 dark:text-white break-all">{qrDetails.url || 'N/A'}</p>
                    </div>
                  </div>

                {/* Scan Details Section */}
                <div className="bg-gray-100 dark:bg-customBlack p-6 rounded-lg">
                  <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">{t.mainQRScanDetails}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-700">
                          <th className="text-left py-2 text-gray-700 dark:text-gray-400">{t.referrer}</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-400">{t.userAgent}</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-400">{t.ip}</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-400">{t.when}</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-400">{t.id}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qrDetails.scanDetails && qrDetails.scanDetails.length > 0 ? (
                          qrDetails.scanDetails.map((scan, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-800">
                              <td className="py-2 text-gray-900 dark:text-white">{scan.referrer || 'N/A'}</td>
                              <td className="py-2 text-gray-900 dark:text-white">{scan.userAgent || 'N/A'}</td>
                              <td className="py-2 text-gray-900 dark:text-white">{scan.ip || 'N/A'}</td>
                              <td className="py-2 text-gray-900 dark:text-white">{scan.when ? new Date(scan.when).toLocaleString() : 'N/A'}</td>
                              <td className="py-2 text-gray-900 dark:text-white">{scan.id || 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-600 dark:text-gray-400">
                              {t.noScanDetailsAvailable}
                            </td>
                          </tr>
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
                              <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
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
                          onClick={() => {/* Add edit functionality */}}
                          className="px-6 py-3"
                        />
                        <CommonButton
                          text="View Full Analytics"
                          icon={<MdAnalytics className="w-4 h-4" />}
                          onClick={() => {/* Add full analytics view */}}
                          className="px-6 py-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">{t.noQRCodeDetailsAvailable}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Advanced Filters and Search Section */}
      <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search Bar */}
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

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium transition-all duration-200 ${
                showFilters || statusFilter !== 'all' || dateFilter !== 'all'
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
              className={`inline-flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium transition-all duration-200 ${
                sortBy === 'scanCount'
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
                className="px-4 py-3 text-sm"
              />
            )}
          </div>
        </div>

        {/* Expandable Filters */}
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
      </div>

      {/* Results Summary */}
      <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-6">
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
      </div>

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
                  onClick={handleCreateQR}
                  className="px-6 py-3"
                />
              ) : (
                <CommonOutlineButton
                  text="Reset Filters"
                  onClick={handleResetFilters}
                  className="px-6 py-3"
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

export default myQRCodes;