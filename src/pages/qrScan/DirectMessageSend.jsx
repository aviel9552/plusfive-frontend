import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQRCodeByCode, shareQRCode } from '../../redux/services/qrServices';

function DirectMessageSend() {
  const { qrId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef to prevent multiple API calls
  const hasCalledAPI = useRef(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cleanup previous request if component re-renders
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (qrId && !hasCalledAPI.current) {
      hasCalledAPI.current = true; // Mark as called immediately
      abortControllerRef.current = new AbortController();
      handleQRCodeLoad();
    } else if (!qrId) {
      setError('Invalid QR code');
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run once

  const handleQRCodeLoad = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get QR code details using getQRCodeByCode API
      const response = await getQRCodeByCode(qrId);
      
      if (response && response.data) {
        setQrData(response.data);
        
        // After getting data, redirect to WhatsApp using directUrl
        await redirectToWhatsApp(response.data);
      } else {
        setError('QR code not found');
      }
    } catch (err) {
      // Only set error if request wasn't aborted
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load QR code');
        console.error('QR Code Load Error:', err);
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
        console.error('Failed to increment share count:', shareError);
        
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
      <div className="flex justify-center items-center h-screen text-xl">
        Loading QR Code...
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