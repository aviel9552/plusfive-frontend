import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { CommonButton } from '../index';

const AuthDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const checkAuthState = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');
    
    const info = {
      reduxState: {
        isAuthenticated,
        user: user ? { id: user.id, email: user.email, role: user.role } : null
      },
      localStorage: {
        token: token ? { exists: true, length: token.length, value: token.substring(0, 20) + '...' } : { exists: false },
        userData: userData ? { exists: true, parsed: JSON.parse(userData) } : { exists: false },
        userRole: userRole ? { exists: true, value: userRole } : { exists: false }
      },
      validation: {
        hasValidToken: token && token !== 'undefined' && token !== 'null',
        hasValidUser: user && user.id,
        tokenFormat: token ? `Bearer ${token.substring(0, 20)}...` : 'No token'
      }
    };
    
    setDebugInfo(info);
    console.log('🔍 Authentication Debug Info:', info);
  };

  const testStripeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found in localStorage');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe/subscription`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('🧪 Stripe Auth Test Result:', { status: response.status, data });
      
      setDebugInfo(prev => ({
        ...prev,
        stripeTest: { status: response.status, data }
      }));
    } catch (error) {
      console.error('❌ Stripe Auth Test Failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        stripeTest: { error: error.message }
      }));
    }
  };

  const testCheckoutEndpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found in localStorage');
        return;
      }

      console.log('🧪 Testing checkout endpoint...');
      
      // Test with a real price ID from your Stripe setup
      const testPriceId = 'price_1S0JjRHQYvEoMm95CVIXb6A8'; // Starter plan price ID
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: testPriceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      });

      const data = await response.json();
      console.log('🧪 Checkout Test Result:', { status: response.status, data });
      
      // Log the full response for debugging
      console.log('🔍 Full response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });
      
      setDebugInfo(prev => ({
        ...prev,
        checkoutTest: { status: response.status, data }
      }));
    } catch (error) {
      console.error('❌ Checkout Test Failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        checkoutTest: { error: error.message }
      }));
          }
    };

    const testRawAPI = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No token found in localStorage');
          return;
        }

        console.log('🧪 Testing raw API call...');
        
        // Test the exact same call that the service makes
        const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe/checkout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            priceId: 'price_1S0JjRHQYvEoMm95CVIXb6A8',
            successUrl: `${window.location.origin}/subscription/success`,
            cancelUrl: `${window.location.origin}/pricing`
          })
        });

        console.log('🔍 Raw API Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        let data;
        try {
          data = await response.json();
          console.log('✅ Response data parsed:', data);
        } catch (parseError) {
          console.error('❌ Failed to parse response as JSON:', parseError);
          const textData = await response.text();
          console.log('📝 Raw response text:', textData);
          data = { error: 'Failed to parse JSON', rawText: textData };
        }
        
        setDebugInfo(prev => ({
          ...prev,
          rawAPITest: { status: response.status, data, responseInfo: { ok: response.ok, statusText: response.statusText } }
        }));
      } catch (error) {
        console.error('❌ Raw API Test Failed:', error);
        setDebugInfo(prev => ({
          ...prev,
          rawAPITest: { error: error.message }
        }));
      }
    };
  
    return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        🔍 Authentication Debugger
      </h3>
      
      <div className="flex gap-3 mb-4">
        <CommonButton
          text="Check Auth State"
          onClick={checkAuthState}
          className="!py-2 !px-4"
        />
        <CommonButton
          text="Test Stripe Auth"
          onClick={testStripeAuth}
          className="!py-2 !px-4"
        />
        <CommonButton
          text="Test Checkout"
          onClick={testCheckoutEndpoint}
          className="!py-2 !px-4"
        />
        <CommonButton
          text="Raw API Test"
          onClick={testRawAPI}
          className="!py-2 !px-4"
        />
      </div>

      {Object.keys(debugInfo).length > 0 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-700 p-3 rounded border">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Redux State:</h4>
            <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo.reduxState, null, 2)}
            </pre>
          </div>

          <div className="bg-white dark:bg-gray-700 p-3 rounded border">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">LocalStorage:</h4>
            <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo.localStorage, null, 2)}
            </pre>
          </div>

          <div className="bg-white dark:bg-gray-700 p-3 rounded border">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Validation:</h4>
            <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo.validation, null, 2)}
            </pre>
          </div>

          {debugInfo.stripeTest && (
            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Stripe Test:</h4>
              <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify(debugInfo.stripeTest, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo.checkoutTest && (
            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Checkout Test:</h4>
              <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify(debugInfo.checkoutTest, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo.rawAPITest && (
            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Raw API Test:</h4>
              <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify(debugInfo.rawAPITest, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
