import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQRCodesWithAnalytics, fetchQRPerformance } from '../../redux/actions/qrActions';
import { MdQrCode2, MdTrendingUp, MdShare, MdVisibility, MdCalendarToday, MdAnalytics } from 'react-icons/md';
import { FiRefreshCw, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';

const EnhancedQRAnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const { 
    qrAnalytics, 
    qrPerformance, 
    analyticsLoading, 
    analyticsError 
  } = useSelector(state => state.qr);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      await Promise.all([
        dispatch(fetchQRCodesWithAnalytics()),
        dispatch(fetchQRPerformance())
      ]);
    } catch (error) {
      toast.error('Failed to load analytics data');
    }
  };

  const handleRefresh = () => {
    loadAnalytics();
    toast.success('Analytics refreshed!');
  };

  const exportAnalytics = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon!');
  };

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Analytics...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we fetch your QR code analytics
          </p>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdAnalytics className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {analyticsError}
          </p>
          <button
            onClick={loadAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              QR Code Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive insights into your QR code performance
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportAnalytics}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Performance Summary Cards */}
        {qrPerformance && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <MdQrCode2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <MdTrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {qrPerformance.totalQRCodes || 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total QR Codes
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <MdVisibility className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <MdTrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {qrPerformance.totalScans || 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Scans
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <MdShare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <MdTrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {qrPerformance.totalShares || 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Shares
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                  <MdCalendarToday className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <MdTrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {qrPerformance.averageScansPerQR ? qrPerformance.averageScansPerQR.toFixed(1) : 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Avg Scans/QR
              </p>
            </div>
          </div>
        )}

        {/* Detailed Analytics */}
        {qrAnalytics && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              QR Code Performance Details
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Overall Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Active QR Codes:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {qrAnalytics.summary?.activeQRCodes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Average Scans per QR:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {qrAnalytics.summary?.averageScansPerQR || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Average Shares per QR:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {qrAnalytics.summary?.averageSharesPerQR || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Performing QR Codes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Performing QR Codes
                </h3>
                <div className="space-y-3">
                  {qrAnalytics.qrCodes?.slice(0, 3).map((qr, index) => (
                    <div key={qr.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {index + 1}. {qr.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {qr.analytics?.daysSinceCreation || 0} days
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Scans: {qr.analytics?.totalScans || 0}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Shares: {qr.analytics?.totalShares || 0}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Avg/Day: {qr.analytics?.averageScansPerDay || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!qrAnalytics && !qrPerformance && !analyticsLoading && (
          <div className="text-center py-12">
            <MdAnalytics className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Analytics Data Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create some QR codes and start scanning to see analytics data here.
            </p>
            <button
              onClick={loadAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Load Analytics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQRAnalyticsDashboard;
