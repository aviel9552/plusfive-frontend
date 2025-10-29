import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQRCodeByCode, shareQRCode } from '../../redux/services/qrServices';

// Global cache to store QR data and prevent multiple API calls
let globalDirectQRCache = {};

function DirectMessageSend() {
  const { qrId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef to prevent multiple API calls
  const hasCalledAPI = useRef(false);
  const abortControllerRef = useRef(null);

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
        // Redirect to WhatsApp with cached data
        redirectToWhatsApp(cachedData.data);
        return;
      } else {
        setError(cachedData.error);
        setLoading(false);
        return;
      }
    }

    // Prevent multiple calls using ref
    if (hasCalledAPI.current) {
      return;
    }

    // Mark as called immediately to prevent any race conditions
    hasCalledAPI.current = true;
    
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
        return;
      }
      
      if (response && response.data) {
        setQrData(response.data);
        
        // Cache the successful result
        globalDirectQRCache[qrId] = {
          success: true,
          data: response.data
        };
        
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
        // First, call shareQRCode service to increment share count
        await shareQRCode(qrId);
        
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