

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQRCodeByCode, scanQRCode } from '../../redux/services/qrServices';

// Global cache to store QR data and prevent multiple API calls
let globalQRCache = {};
// Global lock to prevent multiple API calls for same QR ID
let globalAPILocks = {};
// Global lock to prevent multiple scan calls
let globalScanLocks = {};
// Global tracker to ensure scan is called only once per QR ID
let globalScannedQRs = {};

export default function QRScanHandler() {
  const { qrId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef to prevent multiple API calls
  const hasCalledAPI = useRef(false);
  const abortControllerRef = useRef(null);
  const hasScannedRef = useRef(false);
  
  useEffect(() => {
    // Only run if we have a qrId
    if (!qrId) {
      setError('Invalid QR code');
      setLoading(false);
      return;
    }

    // Check if we already have cached data for this QR ID
    if (globalQRCache[qrId]) {
      const cachedData = globalQRCache[qrId];
      if (cachedData.success) {
        setQrData(cachedData.data);
        setLoading(false);
        // Redirect to WhatsApp with cached data (scan already done, won't call again)
        redirectToWhatsApp(cachedData.data);
        return;
      } else {
        setError(cachedData.error);
        setLoading(false);
        return;
      }
    }

    // Check global lock - if API call is already in progress for this QR ID, don't make another call
    if (globalAPILocks[qrId]) {
      console.log('API call already in progress for QR ID:', qrId);
      return;
    }

    // Prevent multiple calls using ref
    if (hasCalledAPI.current) {
      return;
    }

    // Mark as called immediately to prevent any race conditions
    hasCalledAPI.current = true;
    // Set global lock for this QR ID
    globalAPILocks[qrId] = true;
    
    // Cleanup previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    handleQRCodeLoad();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Don't release lock on unmount if we have cached data - prevent duplicate calls in StrictMode
      // Only release if there's no cache (meaning API call failed or was aborted)
      if (globalAPILocks[qrId] && !globalQRCache[qrId]) {
        globalAPILocks[qrId] = false;
      }
    };
  }, [qrId]); // Include qrId in dependencies but use ref to prevent multiple calls

  const handleQRCodeLoad = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get QR code details using getQRCodeByCode API
      const response = await getQRCodeByCode(qrId);
      
      // Check if response has success flag
      if (response && response.success === false) {
        const errorMessage = response.message || response.error || 'QR code not found';
        setError(errorMessage);
        
        // Cache the error result
        globalQRCache[qrId] = {
          success: false,
          error: errorMessage
        };
        // Release global lock after error
        globalAPILocks[qrId] = false;
        return;
      }
      
      if (response && response.data) {
        setQrData(response.data);
        
        // Cache the successful result
        globalQRCache[qrId] = {
          success: true,
          data: response.data
        };
        
        // Release global lock after successful API call
        globalAPILocks[qrId] = false;
        
        // After getting data, redirect to WhatsApp
        await redirectToWhatsApp(response.data);
      } else {
        const errorMessage = 'QR code not found';
        setError(errorMessage);
        
        // Cache the error result
        globalQRCache[qrId] = {
          success: false,
          error: errorMessage
        };
        // Release global lock after error
        globalAPILocks[qrId] = false;
      }
    } catch (err) {
      // Only set error if request wasn't aborted
      if (err.name !== 'AbortError') {
        const errorMessage = err.message || 'Failed to load QR code';
        setError(errorMessage);
        
        // Cache the error result
        globalQRCache[qrId] = {
          success: false,
          error: errorMessage
        };
        // Release global lock after error
        globalAPILocks[qrId] = false;
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectToWhatsApp = async (data) => {
    // Use only dynamic data from API response - no static fallbacks
    const customerMessage = data.messageForCustomer;
    const messageUrl = data.messageUrl;

    // Only redirect if we have both message and URL
    if (customerMessage && messageUrl) {
      try {
        // Prevent multiple scan calls - check if already scanned for this QR ID
        // Use global tracker to ensure scan happens only once per QR ID (even in StrictMode)
        if (!globalScannedQRs[qrId] && !globalScanLocks[qrId] && !hasScannedRef.current) {
          globalScanLocks[qrId] = true;
          globalScannedQRs[qrId] = true; // Mark as scanned permanently
          hasScannedRef.current = true;
          
          // First, call scanQRCode service to increment scan count
          await scanQRCode(qrId);
          
          // Don't release lock - keep it locked to prevent duplicate calls
          // globalScanLocks[qrId] remains true permanently
        }
        
        // Create message in simple text format (WhatsApp will auto-detect and make URL clickable)
        const message = `${customerMessage}: ${messageUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

        // 1 sec delay so page load ho sake, then redirect
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 1000);
        
      } catch (scanError) {
        // Continue with redirect even if scan count fails
        const message = `${customerMessage}: ${messageUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 1000);
      }
    } else {
      setError('Required data not available for WhatsApp redirect');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div>Loading QR Code...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        Error: {error}
      </div>
    );
  }

    return (
    <div className="flex justify-center items-center h-screen text-xl">
      Redirecting to WhatsApp...
      </div>
    );
  }



