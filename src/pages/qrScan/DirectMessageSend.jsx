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
      // Prevent multiple share calls - check global lock
      if (!globalShareLocks[qrId] && !hasSharedRef.current) {
        globalShareLocks[qrId] = true;
        hasSharedRef.current = true;
        
        try {
          // First, call shareQRCode service to increment share count
          await shareQRCode(qrId);
        } catch (shareError) {
          console.error('Share count error:', shareError);
          // Continue with redirect even if share count fails
        } finally {
          // Release share lock after call completes
          globalShareLocks[qrId] = false;
        }
      }
      
      // Check if component is still mounted before redirecting
      if (!isMountedRef.current) {
        return;
      }

      // Clear any existing redirect timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      // Set redirect timeout - shorter delay for faster redirect
      redirectTimeoutRef.current = setTimeout(() => {
        // Double check if component is still mounted
        if (isMountedRef.current && hasRedirectedRef.current) {
          // Use window.location.replace to prevent back button navigation
          window.location.replace(directUrl);
        }
      }, 500); // Reduced from 1000ms to 500ms for faster redirect
      
    } catch (error) {
      console.error('Redirect error:', error);
      // Reset redirect flags on error
      globalDirectRedirectLocks[qrId] = false;
      hasRedirectedRef.current = false;
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