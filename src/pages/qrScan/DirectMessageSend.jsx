import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQRCodeByCode, shareQRCode } from '../../redux/services/qrServices';

// Global cache to store QR data and prevent multiple API calls
let globalDirectQRCache = {};
// Global lock to prevent multiple API calls for same QR ID
let globalDirectAPILocks = {};
// Global lock to prevent multiple share calls
let globalShareLocks = {};
// Global lock to prevent multiple redirects
let globalDirectRedirectLocks = {};

function DirectMessageSend() {
  const { qrId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef to prevent multiple API calls
  const hasCalledAPI = useRef(false);
  const abortControllerRef = useRef(null);
  const hasSharedRef = useRef(false);
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
    if (globalDirectQRCache[qrId]) {
      const cachedData = globalDirectQRCache[qrId];
      if (cachedData.success) {
        setQrData(cachedData.data);
        setLoading(false);
        // Only redirect if not already redirected
        if (!hasRedirectedRef.current && !globalDirectRedirectLocks[qrId]) {
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
      if (globalDirectAPILocks[qrId]) {
        globalDirectAPILocks[qrId] = false;
      }
      if (globalDirectRedirectLocks[qrId]) {
        globalDirectRedirectLocks[qrId] = false;
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
        
        // Only redirect if component is still mounted and not already redirected
        if (isMountedRef.current && !hasRedirectedRef.current && !globalDirectRedirectLocks[qrId]) {
          // After getting data, redirect to WhatsApp using directUrl
          await redirectToWhatsApp(response.data);
        }
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
    // Prevent multiple redirects - check if already redirected or redirect in progress
    if (hasRedirectedRef.current || globalDirectRedirectLocks[qrId] || !isMountedRef.current) {
      return;
    }

    // Set redirect lock immediately
    globalDirectRedirectLocks[qrId] = true;
    hasRedirectedRef.current = true;

    // Use directUrl from API response for WhatsApp redirect
    const directUrl = data.directUrl;

    if (!directUrl) {
      setError('WhatsApp redirect URL not available');
      globalDirectRedirectLocks[qrId] = false;
      hasRedirectedRef.current = false;
      return;
    }

    try {
      // Check if component is still mounted before proceeding
      if (!isMountedRef.current) {
        return;
      }

      // Attempt share count API call (non-blocking - don't wait for it)
      // This runs in background and won't block redirect if it fails
      if (!globalShareLocks[qrId] && !hasSharedRef.current) {
        globalShareLocks[qrId] = true;
        hasSharedRef.current = true;
        
        // Fire and forget - don't await, let it run in background
        shareQRCode(qrId)
          .then(() => {
            console.log('✅ Share count updated successfully');
          })
          .catch((shareError) => {
            // Silent fail - just log, don't block redirect
            console.warn('⚠️ Share count update failed (continuing with redirect):', shareError.message || shareError);
          })
          .finally(() => {
            // Release share lock after call completes (success or failure)
            globalShareLocks[qrId] = false;
          });
      }

      // Clear any existing redirect timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      // Immediate redirect - don't wait for share API
      // This ensures WhatsApp redirect works even if backend is unreachable
      redirectTimeoutRef.current = setTimeout(() => {
        // Double check if component is still mounted
        if (isMountedRef.current && hasRedirectedRef.current) {
          // Use window.location.replace to prevent back button navigation
          window.location.replace(directUrl);
        }
      }, 300); // Reduced delay for faster redirect
      
    } catch (error) {
      console.error('Redirect error:', error);
      // Reset redirect flags on error, but still try to redirect
      globalDirectRedirectLocks[qrId] = false;
      hasRedirectedRef.current = false;
      
      // Even on error, try to redirect if we have the URL
      if (directUrl) {
        setTimeout(() => {
          window.location.replace(directUrl);
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

export default DirectMessageSend;