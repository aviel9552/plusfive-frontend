import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchQRCodes, createQRCodeAction, deleteQRCode } from '../../../redux/actions/qrActions';
import CommonAdminTable from '../../../components/commonComponent/CommonAdminTable';
import CommonPagination from '../../../components/commonComponent/CommonPagination';
import CommonButton from '../../../components/commonComponent/CommonButton';
import { useLanguage } from '../../../context/LanguageContext';
import enTranslations from '../../../i18/en.json';
import heTranslations from '../../../i18/he.json';

function AdminQRManagementListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const translations = language === 'he' ? heTranslations : enTranslations;
  const t = translations.adminQR;
  
  const qrState = useSelector((state) => state.qr);
  
  // Correctly access the nested qrCodes structure
  const qrCodes = qrState.qrCodes?.qrCodes || qrState.qrCodes || [];
  const pagination = qrState.qrCodes?.pagination || qrState.pagination;
  const { loading, error } = qrState;
  
  // Local state for search and pagination
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
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

  // Handle delete QR code
  const handleDeleteQR = async (qr) => {
    const result = await dispatch(deleteQRCode(qr.id));
  };

  // Handle edit QR code
  const handleEditQR = (qr) => {
    // Add edit functionality here
  };

  // Handle view QR code details
  const handleViewQR = (qr) => {
    // Add view functionality here
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
            className="w-16 h-16 object-contain border border-gray-200 rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
            {t.noImage}
          </div>
        )
      )
    },
    {
      key: 'qrData',
      label: t.code,
      render: (qr) => (
        <div className="max-w-xs truncate" title={qr.qrData || qr.qrdata}>
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
      render: (qr) => qr.scanCount || 0,
      sortable: true
    },
    {
      key: 'createdAt',
      label: t.createdAt,
      render: (qr) => new Date(qr.createdAt).toLocaleDateString(),
      sortable: true
    }
  ];

  // Log Redux state changes
  useEffect(() => {
  }, [qrCodes, pagination, loading, error]);

  return (
    <div className="p-4 md:p-6 dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl text-white">
      <div className="flex justify-between items-center mb-6">
        <CommonButton
          text={t.createNewQRCode}
          onClick={handleCreateQR}
          className="pt-3 pb-2 px-6 rounded-xl"
        />
        <div className="relative w-64">
          <input
            type="text"
            placeholder={t.search}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
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

export default AdminQRManagementListing;