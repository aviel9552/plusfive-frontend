import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIndividualQRAnalytics } from '../../redux/actions/qrActions';
import { MdQrCode2, MdTrendingUp, MdShare, MdVisibility, MdCalendarToday, MdAnalytics, MdRefresh } from 'react-icons/md';
import { toast } from 'react-toastify';

const IndividualQRAnalytics = ({ qrId, qrName }) => {
  const dispatch = useDispatch();
  const { individualQRAnalytics, analyticsLoading, analyticsError } = useSelector(state => state.qr);

  useEffect(() => {
    if (qrId) {
      loadIndividualAnalytics();
    }
  }, [qrId]);

  const loadIndividualAnalytics = async () => {
    try {
      await dispatch(fetchIndividualQRAnalytics(qrId));
    } catch (error) {
      toast.error('Failed to load individual QR analytics');
    }
  };

  const handleRefresh = () => {
    loadIndividualAnalytics();
    toast.success('Analytics refreshed!');
  };

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-3">
          <MdAnalytics className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Analytics Error
          </h3>
        </div>
        <p className="text-red-700 dark:text-red-200 mb-3">
          {analyticsError}
        </p>
        <button
          onClick={loadIndividualAnalytics}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!individualQRAnalytics) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <MdAnalytics className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No analytics data available for this QR code
          </p>
        </div>
      </div>
    );
  }

  const { qrCode, analytics } = individualQRAnalytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {qrName || qrCode?.name || 'QR Code Analytics'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed performance insights for this specific QR code
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mt-4 sm:mt-0"
        >
          <MdRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* QR Code Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <MdQrCode2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            QR Code Status
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {qrCode?.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {qrCode?.createdAt ? new Date(qrCode.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <MdVisibility className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {analytics?.totalScans || 0}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Scans</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analytics?.averageScansPerDay || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg per Day</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <MdShare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {analytics?.sharedCount || 0}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {analytics?.averageSharesPerDay || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg per Day</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <MdTrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {analytics?.totalScans || 0}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {analytics?.engagementRate || 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detailed Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Peak Scans/Day:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.peakScansPerDay || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Lowest Scans/Day:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.lowestScansPerDay || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Total Unique Users:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.uniqueUsers || 0}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Mobile Scans:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.mobileScans || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Desktop Scans:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.desktopScans || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Conversion Rate:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.conversionRate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* No Data State */}
      {(!analytics || Object.keys(analytics).length === 0) && (
        <div className="text-center py-8">
          <MdAnalytics className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Analytics Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This QR code hasn't been scanned yet or analytics are still being collected.
          </p>
          <button
            onClick={loadIndividualAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Analytics
          </button>
        </div>
      )}
    </div>
  );
};

export default IndividualQRAnalytics;
