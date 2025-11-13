import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQRCodeByCode, shareQRCode } from '../../redux/services/qrServices';

// Global cache to store QR data and prevent multiple API calls
let globalDirectQRCache = {};
// Global lock to prevent multiple API calls for same QR ID
let globalDirectAPILocks = {};
// Global lock to prevent multiple share calls
let globalShareLocks = {};
// Global tracker to ensure share is called only once per QR ID
let globalSharedQRs = {};

function DirectMessageSend() {
  const { qrId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef to prevent multiple API calls
  const hasCalledAPI = useRef(false);
  const abortControllerRef = useRef(null);
  const hasSharedRef = useRef(false);

  useEffect(() => {
    // Only run if we have a qrId
    if (!qrId) {
      setError('Invalid QR code');
      setLoading(false);
      return;
    }

    // Check if we already have cached data for this QR ID
    if (globalDirectQRCache[qrId]) {
      const cachedData = globalDirectQRCache[qrId];
      if (cachedData.success) {
        setQrData(cachedData.data);
        setLoading(false);
        // Redirect to WhatsApp with cached data (share already done, won't call again)
        redirectToWhatsApp(cachedData.data);
        return;
      } else {
        setError(cachedData.error);
        setLoading(false);
        return;
      }
    }

    // Check global lock - if API call is already in progress for this QR ID, don't make another call
    if (globalDirectAPILocks[qrId]) {
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
    globalDirectAPILocks[qrId] = true;
    
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
      if (globalDirectAPILocks[qrId] && !globalDirectQRCache[qrId]) {
        globalDirectAPILocks[qrId] = false;
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
        globalDirectQRCache[qrId] = {
          success: false,
          error: errorMessage
        };
        // Release global lock after error
        globalDirectAPILocks[qrId] = false;
        return;
      }
      
      if (response && response.data) {
        setQrData(response.data);
        
        // Cache the successful result
        globalDirectQRCache[qrId] = {
          success: true,
          data: response.data
        };
        
        // Release global lock after successful API call
        globalDirectAPILocks[qrId] = false;
        
        // After getting data, redirect to WhatsApp using directUrl
        await redirectToWhatsApp(response.data);
      } else {
        const errorMessage = 'QR code not found';
        setError(errorMessage);
        
        // Cache the error result
        globalDirectQRCache[qrId] = {
          success: false,
          error: errorMessage
        };
        // Release global lock after error
        globalDirectAPILocks[qrId] = false;
      }
    } catch (err) {
      // Only set error if request wasn't aborted
      if (err.name !== 'AbortError') {
        const errorMessage = err.message || 'Failed to load QR code';
        setError(errorMessage);
        
        // Cache the error result
        globalDirectQRCache[qrId] = {
          success: false,
          error: errorMessage
        };
        // Release global lock after error
        globalDirectAPILocks[qrId] = false;
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectToWhatsApp = async (data) => {
    // Use directUrl from API response for WhatsApp redirect
    const directUrl = data.directUrl;

    if (directUrl) {
      try {
        // Prevent multiple share calls - check if already shared for this QR ID
        // Use global tracker to ensure share happens only once per QR ID (even in StrictMode)
        if (!globalSharedQRs[qrId] && !globalShareLocks[qrId] && !hasSharedRef.current) {
          globalShareLocks[qrId] = true;
          globalSharedQRs[qrId] = true; // Mark as shared permanently
          hasSharedRef.current = true;
          
          // First, call shareQRCode service to increment share count
          await shareQRCode(qrId);
          
          // Don't release lock - keep it locked to prevent duplicate calls
          // globalShareLocks[qrId] remains true permanently
        }
        
        // Then redirect to WhatsApp
        setTimeout(() => {
          window.location.href = directUrl;
        }, 1000);
        
      } catch (shareError) {
        // Continue with redirect even if share count fails
        setTimeout(() => {
          window.location.href = directUrl;
        }, 1000);
      }
      
    } else {
      setError('WhatsApp redirect URL not available');
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

export default DirectMessageSend;