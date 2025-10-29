

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQRCodeByCode, scanQRCode } from '../../redux/services/qrServices';

// Global flag to prevent multiple API calls across all instances
let globalAPICallFlag = {};

export default function QRScanHandler() {
  const { qrId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef to prevent multiple API calls
  const hasCalledAPI = useRef(false);
  const abortControllerRef = useRef(null);
  
  useEffect(() => {
    // Only run if we haven't called the API yet and we have a qrId
    if (!qrId) {
      setError('Invalid QR code');
      setLoading(false);
      return;
    }

    // Check global flag first - if already called and we have an error or success, don't call again
    if (globalAPICallFlag[qrId]) {
      setLoading(false);
      // If we don't have error or data, set a generic error
      // if (!error && !qrData) {
      //   setError('Failed to load QR code');
      // }
      return;
    }

    // Prevent multiple calls using ref
    if (hasCalledAPI.current) {
      setLoading(false);
      // If we don't have error or data, set a generic error
      if (!error && !qrData) {
        setError('Failed to load QR code');
      }
      return;
    }

    // Mark as called immediately to prevent any race conditions
    hasCalledAPI.current = true;
    globalAPICallFlag[qrId] = true;
    
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
        setError(response.message || response.error || 'QR code not found');
        return;
      }
      
      if (response && response.data) {
        setQrData(response.data);
        
        // After getting data, redirect to WhatsApp
        await redirectToWhatsApp(response.data);
      } else {
        setError('QR code not found');
      }
    } catch (err) {
      // Only set error if request wasn't aborted
      if (err.name !== 'AbortError') {
        // The API service already formats the error message, so use it directly
        setError(err.message || 'Failed to load QR code');
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
        // First, call scanQRCode service to increment scan count
        await scanQRCode(qrId);
        
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



