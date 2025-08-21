import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyQRCodes, createQRCodeAction, deleteQRCode } from '../../../redux/actions/qrActions';
import CommonAdminTable from '../../../components/commonComponent/CommonAdminTable';
import CommonPagination from '../../../components/commonComponent/CommonPagination';
import CommonButton from '../../../components/commonComponent/CommonButton';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminQRTranslations } from '../../../utils/translations';
import { getQRCodeById } from '../../../redux/services/qrServices';
import { toast } from 'react-toastify';

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
  
  // Modal state for QR details
  const [showModal, setShowModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [qrDetails, setQrDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filter QR codes based on search value
  const filteredQRCodes = qrCodes.filter(qr => {
    if (!searchValue || searchValue.trim() === '') return true;

    const searchLower = searchValue.toLowerCase().trim();

    // Check QR code fields
    const nameMatch = qr.name?.toLowerCase().includes(searchLower) || false;
    const urlMatch = qr.url?.toLowerCase().includes(searchLower) || false;
    const qrDataMatch = (qr.qrData || qr.qrdata)?.toLowerCase().includes(searchLower) || false;
    const scanCountMatch = qr.scanCount?.toString().includes(searchLower) || false;

    // Check owner fields
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

    return nameMatch || urlMatch || qrDataMatch || scanCountMatch || ownerNameMatch || ownerEmailMatch;
  });

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
  // Handle create QR code - redirect to qr-management page
  const handleAllQRCodes = () => {
    navigate(`/${slug}/qr-management/listing`);
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

  // Define table columns
  const columns = [
    {
      key: 'qrImage',
      label: t.qrImage,
      render: (qr) => (
        qr.qrCodeImage ? (
          <img
            src={qr.qrCodeImage}
            alt={`QR Code for ${qr.name}`}
            className="w-16 h-16 object-contain border border-gray-200 dark:border-gray-600 rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            {t.noImage}
          </div>
        )
      )
    },
    {
      key: 'qrData',
      label: t.code,
      render: (qr) => (
        <div className="max-w-xs truncate text-gray-900 dark:text-white" title={qr.qrData || qr.qrdata}>
          {qr.qrData || qr.qrdata}
        </div>
      )
    },
    {
      key: 'owner',
      label: t.owner,
      render: (qr) => {
        const user = qr.user;
        if (!user) return 'N/A';

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
      key: 'scanCount',
      label: t.scanCount,
      render: (qr) => <span className="text-gray-900 dark:text-white">{qr.scanCount || 0}</span>,
      sortable: true
    },
    {
      key: 'createdAt',
      label: t.createdAt,
      render: (qr) => <span className="text-gray-900 dark:text-white">{new Date(qr.createdAt).toLocaleDateString()}</span>,
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
                      </tbody>
                    </table>
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
      <div className="flex justify-between items-center mb-6">
        <div className='flex gap-4'>

          <CommonButton
            text={t.createNewQRCode}
            onClick={handleCreateQR}
            className="py-2 px-6 rounded-xl"
          />
          {user.role === 'admin' && (
            <CommonButton
              text={t.showAllCodes}
              onClick={handleAllQRCodes}
              className="py-2 px-6 rounded-xl"
            />
          )}
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder={t.search}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" aria-hidden="true">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      {/* QR Codes Table using CommonAdminTable */}
      <div className="mt-6">
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
          showPagination={false} // We'll use our own pagination
          showFilterBar={false} // Hide filter bar for QR Management
          noDataComponent={t.noQRCodesFound}
          loadingComponent={t.loadingQRCodes}
        />
      </div>

      {/* Custom Pagination using CommonPagination */}
      {totalItems > 0 && (
        <div className="mt-6">
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

    </div>
  );
}

export default myQRCodes;