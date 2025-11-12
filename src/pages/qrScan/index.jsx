

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQRCodeByCode, scanQRCode } from '../../redux/services/qrServices';

// Global cache to store QR data and prevent multiple API calls
let globalQRCache = {};
// Global lock to prevent multiple API calls for same QR ID
let globalAPILocks = {};
// Global lock to prevent multiple scan calls
let globalScanLocks = {};
// Global lock to prevent multiple redirects
let globalRedirectLocks = {};

export default function QRScanHandler() {
  const { qrId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef to prevent multiple API calls
  const hasCalledAPI = useRef(false);
  const abortControllerRef = useRef(null);
  const hasScannedRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const redirectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  
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
        // Only redirect if not already redirected
        if (!hasRedirectedRef.current && !globalRedirectLocks[qrId]) {
          redirectToWhatsApp(cachedData.data);
        }
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

    // Set mounted flag
    isMountedRef.current = true;

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Cancel pending redirect
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
      // Release locks on unmount
      if (globalAPILocks[qrId]) {
        globalAPILocks[qrId] = false;
      }
      if (globalRedirectLocks[qrId]) {
        globalRedirectLocks[qrId] = false;
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
        
        // Only redirect if component is still mounted and not already redirected
        if (isMountedRef.current && !hasRedirectedRef.current && !globalRedirectLocks[qrId]) {
          // After getting data, redirect to WhatsApp
          await redirectToWhatsApp(response.data);
        }
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
    // Prevent multiple redirects - check if already redirected or redirect in progress
    if (hasRedirectedRef.current || globalRedirectLocks[qrId] || !isMountedRef.current) {
      return;
    }

    // Set redirect lock immediately
    globalRedirectLocks[qrId] = true;
    hasRedirectedRef.current = true;

    // Use only dynamic data from API response - no static fallbacks
    const customerMessage = data.messageForCustomer;
    const messageUrl = data.messageUrl;

    // Only redirect if we have both message and URL
    if (!customerMessage || !messageUrl) {
      setError('Required data not available for WhatsApp redirect');
      globalRedirectLocks[qrId] = false;
      hasRedirectedRef.current = false;
      return;
    }

    try {
      // Create message in simple text format (WhatsApp will auto-detect and make URL clickable)
      const message = `${customerMessage}: ${messageUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

      // Check if component is still mounted before proceeding
      if (!isMountedRef.current) {
        return;
      }

      // Attempt scan count API call (non-blocking - don't wait for it)
      // This runs in background and won't block redirect if it fails
      if (!globalScanLocks[qrId] && !hasScannedRef.current) {
        globalScanLocks[qrId] = true;
        hasScannedRef.current = true;
        
        // Fire and forget - don't await, let it run in background
        scanQRCode(qrId)
          .then(() => {
            console.log('✅ Scan count updated successfully');
          })
          .catch((scanError) => {
            // Silent fail - just log, don't block redirect
            console.warn('⚠️ Scan count update failed (continuing with redirect):', scanError.message || scanError);
          })
          .finally(() => {
            // Release scan lock after call completes (success or failure)
            globalScanLocks[qrId] = false;
          });
      }
      
      // Clear any existing redirect timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      // Immediate redirect - don't wait for scan API
      // This ensures WhatsApp redirect works even if backend is unreachable
      redirectTimeoutRef.current = setTimeout(() => {
        // Double check if component is still mounted
        if (isMountedRef.current && hasRedirectedRef.current) {
          // Use window.location.replace to prevent back button navigation
          window.location.replace(whatsappUrl);
        }
      }, 300); // Reduced delay for faster redirect
      
    } catch (error) {
      console.error('Redirect error:', error);
      // Reset redirect flags on error, but still try to redirect
      globalRedirectLocks[qrId] = false;
      hasRedirectedRef.current = false;
      
      // Even on error, try to redirect if we have the data
      if (customerMessage && messageUrl) {
        const message = `${customerMessage}: ${messageUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        setTimeout(() => {
          window.location.replace(whatsappUrl);
        }, 500);
      }
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



