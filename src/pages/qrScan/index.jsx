

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQRCodeByCode, scanQRCode } from '../../redux/services/qrServices';

export default function QRScanHandler() {
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
        
        // After getting data, redirect to WhatsApp
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
        console.error('Failed to increment scan count:', scanError);
        
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



