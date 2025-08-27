import React, { useState } from 'react';
import { CommonButton } from '../index';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import { FaFlask, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

function StripeTest() {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  
  const {
    prices,
    currentSubscription,
    loading,
    pricesLoading,
    subscriptionLoading,
    isAuthenticated,
    fetchPrices,
    fetchSubscription
  } = useStripeSubscription();

  const runTests = async () => {
    setIsRunning(true);
    setTestResults({});

    const results = {};

    try {
      // Test 1: Check if user is authenticated
      results.authentication = {
        status: isAuthenticated ? 'success' : 'warning',
        message: isAuthenticated ? 'User is authenticated' : 'User not authenticated (some features may be limited)',
        details: `Authentication status: ${isAuthenticated}`
      };

      // Test 2: Test prices endpoint
      try {
        await fetchPrices();
        results.prices = {
          status: 'success',
          message: 'Prices endpoint working',
          details: `Found ${prices?.length || 0} pricing plans`
        };
      } catch (error) {
        results.prices = {
          status: 'error',
          message: 'Prices endpoint failed',
          details: error.message
        };
      }

      // Test 3: Test subscription endpoint (if authenticated)
      if (isAuthenticated) {
        try {
          await fetchSubscription();
          results.subscription = {
            status: 'success',
            message: 'Subscription endpoint working',
            details: currentSubscription ? `Current plan: ${currentSubscription.planName || 'Unknown'}` : 'No active subscription'
          };
        } catch (error) {
          results.subscription = {
            status: 'error',
            message: 'Subscription endpoint failed',
            details: error.message
          };
        }
      } else {
        results.subscription = {
          status: 'warning',
          message: 'Subscription endpoint skipped',
          details: 'User not authenticated'
        };
      }

      // Test 4: Check environment variables
      const apiUrl = import.meta.env.VITE_API_URL;
      results.environment = {
        status: apiUrl ? 'success' : 'error',
        message: apiUrl ? 'Environment variables configured' : 'Missing VITE_API_URL',
        details: `API URL: ${apiUrl || 'Not set'}`
      };

    } catch (error) {
      results.general = {
        status: 'error',
        message: 'Test suite failed',
        details: error.message
      };
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheck className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FaTimes className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <FaSpinner className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaFlask className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Stripe Integration Test
        </h2>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Test the Stripe integration to ensure all endpoints are working correctly.
        </p>
        
        <CommonButton
          text={isRunning ? 'Running Tests...' : 'Run Tests'}
          onClick={runTests}
          disabled={isRunning}
          className="!py-2 !px-4"
          icon={isRunning ? <FaSpinner className="animate-spin" /> : null}
        />
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Test Results:</h3>
          
          {Object.entries(testResults).map(([testName, result]) => (
            <div
              key={testName}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {testName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current State */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current State:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Loading States:</span>
            <span className="text-gray-900 dark:text-white">
              Prices: {pricesLoading ? 'Loading...' : 'Ready'} | 
              Subscription: {subscriptionLoading ? 'Loading...' : 'Ready'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Prices Count:</span>
            <span className="text-gray-900 dark:text-white">{prices?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Has Subscription:</span>
            <span className="text-gray-900 dark:text-white">{currentSubscription ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StripeTest;
