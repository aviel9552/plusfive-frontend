import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQRCodesWithAnalytics, fetchQRPerformance } from '../../redux/actions/qrActions';

const TestQRAnalytics = () => {
  const dispatch = useDispatch();
  const { 
    qrAnalytics, 
    qrPerformance, 
    analyticsLoading, 
    analyticsError 
  } = useSelector(state => state.qr);

  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    testAnalytics();
  }, []);

  const testAnalytics = async () => {
    
    // Check environment
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    
    if (!apiUrl) {
      console.error('❌ VITE_API_URL is not configured!');
      setTestResults(prev => ({ ...prev, error: 'VITE_API_URL environment variable is missing' }));
      return;
    }
    
    if (!token) {
      console.error('❌ No authentication token found!');
      setTestResults(prev => ({ ...prev, error: 'No authentication token found. Please log in.' }));
      return;
    }
    
    try {
        // Test QR Analytics
      const analyticsResult = await dispatch(fetchQRCodesWithAnalytics());
      setTestResults(prev => ({ ...prev, analytics: analyticsResult }));

      // Test QR Performance
      const performanceResult = await dispatch(fetchQRPerformance());
      setTestResults(prev => ({ ...prev, performance: performanceResult }));

    } catch (error) {
      console.error('❌ Test Error:', error);
      setTestResults(prev => ({ ...prev, error: error.message }));
    }
  };

  const handleRetest = () => {
    setTestResults({});
    testAnalytics();
  };

  const testDirectAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (!apiUrl) {
        throw new Error('No API URL configured');
      }
      
      if (!token) {
        throw new Error('No authentication token');
      }
      
      // Test direct API call
      const response = await fetch(`${apiUrl}/api/qr/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      setTestResults(prev => ({ 
        ...prev, 
        directAPI: { 
          success: response.ok, 
          status: response.status, 
          data 
        } 
      }));
      
    } catch (error) {
      console.error('❌ Direct API Error:', error);
      setTestResults(prev => ({ ...prev, directAPIError: error.message }));
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🧪 QR Analytics Test Component
      </h3>
      
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleRetest}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retest Analytics
          </button>
          <button
            onClick={testAnalytics}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Test Again
          </button>
          <button
            onClick={testDirectAPI}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Test Direct API
          </button>
        </div>

        {/* Environment Info */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">🔧 Environment Check:</h4>
          <div className="text-sm space-y-1">
            <div>VITE_API_URL: {import.meta.env.VITE_API_URL || '❌ NOT SET'}</div>
            <div>Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</div>
            <div>Token Length: {localStorage.getItem('token')?.length || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Redux State */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Redux State:</h4>
            <div className="text-sm space-y-1">
              <div>Loading: {analyticsLoading ? '🔄 Yes' : '✅ No'}</div>
              <div>Error: {analyticsError ? `❌ ${analyticsError}` : '✅ None'}</div>
              <div>Analytics: {qrAnalytics ? '✅ Loaded' : '❌ Not loaded'}</div>
              <div>Performance: {qrPerformance ? '✅ Loaded' : '❌ Not loaded'}</div>
            </div>
          </div>

          {/* Test Results */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Results:</h4>
            <div className="text-sm space-y-1">
              {testResults.analytics && (
                <div>Analytics: {testResults.analytics.success ? '✅ Success' : '❌ Failed'}</div>
              )}
              {testResults.performance && (
                <div>Performance: {testResults.performance.success ? '✅ Success' : '❌ Failed'}</div>
              )}
              {testResults.directAPI && (
                <div>Direct API: {testResults.directAPI.success ? '✅ Success' : '❌ Failed'} ({testResults.directAPI.status})</div>
              )}
              {testResults.error && (
                <div className="text-red-600">Error: {testResults.error}</div>
              )}
              {testResults.directAPIError && (
                <div className="text-red-600">Direct API Error: {testResults.directAPIError}</div>
              )}
            </div>
          </div>
        </div>

        {/* Direct API Results */}
        {testResults.directAPI && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Direct API Response:</h4>
            <pre className="text-xs text-purple-800 dark:text-purple-200 overflow-auto">
              {JSON.stringify(testResults.directAPI, null, 2)}
            </pre>
          </div>
        )}

        {/* Raw Data Display */}
        {qrAnalytics && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Analytics Data:</h4>
            <pre className="text-xs text-green-800 dark:text-green-200 overflow-auto">
              {JSON.stringify(qrAnalytics, null, 2)}
            </pre>
          </div>
        )}

        {qrPerformance && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Performance Data:</h4>
            <pre className="text-xs text-blue-800 dark:text-blue-200 overflow-auto">
              {JSON.stringify(qrPerformance, null, 2)}
            </pre>
          </div>
        )}

        {analyticsError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Error Details:</h4>
            <p className="text-sm text-red-800 dark:text-red-200">{analyticsError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestQRAnalytics;
