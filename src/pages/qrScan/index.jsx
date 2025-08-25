import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getQRCodeById, recordQRScan } from '../../redux/services/qrServices';
import { MdQrCode2, MdError, MdRefresh, MdContentCopy, MdDownload, MdCheckCircle, MdAnalytics, MdVisibility, MdShare, MdTrendingUp } from 'react-icons/md';
import { FiExternalLink, FiHome, FiCopy } from 'react-icons/fi';
import CommonButton from '../../components/commonComponent/CommonButton';
import CommonOutlineButton from '../../components/commonComponent/CommonOutlineButton';

function QRScanHandler() {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const [isScanEvent, setIsScanEvent] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5000);

  useEffect(() => {
    if (qrId) {
      handleQRCodeLoad();
    } else {
      setError('Invalid QR code');
      setLoading(false);
    }
  }, [qrId]);

  // Check if this is a scan event (someone actually scanned the QR code)
  useEffect(() => {
    // If referrer is empty or from external source, this is likely a scan
    const isExternalScan = !document.referrer || 
                          !document.referrer.includes(window.location.origin) ||
                          document.referrer === '';
    
    if (isExternalScan) {
      setIsScanEvent(true);
    }
  }, []);

  // Auto-redirect countdown effect for scan events
  useEffect(() => {
    if (isScanEvent && qrData?.url && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isScanEvent && qrData?.url && redirectCountdown === 0) {
      // Auto-redirect after countdown
      handleRedirect();
    }
  }, [isScanEvent, qrData?.url, redirectCountdown]);

  // Record scan event when isScanEvent is true
  useEffect(() => {
    if (isScanEvent && qrData) {
      recordScanEvent();
    }
  }, [isScanEvent, qrData]);

  const handleQRCodeLoad = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get QR code details
      const response = await getQRCodeById(qrId);
      
      if (response && response.data) {
        setQrData(response.data);
        
        // If this is a scan event, record analytics
        if (isScanEvent) {
          await recordScanEvent();
        }
      } else {
        setError('QR code not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load QR code');
      console.error('QR Code Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordScanEvent = async () => {
    try {
      // Record scan analytics - use the actual database ID, not the QR code string
      const scanData = {
        qrCodeId: qrData?.id || qrData?._id || qrId, // Use database ID if available, fallback to qrId
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'Direct',
        ipAddress: 'auto-detected', // Will be detected by backend
        deviceInfo: {
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      console.log('Scan data:', scanData);
      console.log('QR Data structure:', qrData);
      console.log('Using QR Code ID:', scanData.qrCodeId);
      
      await recordQRScan(scanData);
      // toast.success('Scan recorded! Analytics updated.');
    } catch (err) {
      console.error('Failed to record scan:', err);
      // Don't show error to user for analytics failure
    }
  };

  const handleRedirect = () => {
    if (qrData?.url) {
      window.location.href = qrData.url;
    } else {
      toast.error('Destination URL not available.');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    handleQRCodeLoad();
  };

  const handleCopyQRData = async () => {
    const qrDataText = qrData?.qrData || qrData?.qrdata || qrData?.url || window.location.href;
    try {
      await navigator.clipboard.writeText(qrDataText);
      toast.success('QR data copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = qrDataText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('QR data copied to clipboard!');
    }
  };

  const handleDownloadQR = () => {
    if (qrData?.qrCodeImage) {
      const link = document.createElement('a');
      link.href = qrData.qrCodeImage;
      link.download = `${qrData.name || 'QRCode'}-${qrId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded successfully!');
    } else {
      toast.info('QR code image not available for download');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-4">
        <div className="text-center p-6 max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-purple-600 mx-auto mb-4 sm:mb-6"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isScanEvent ? 'Processing Scan...' : 'Loading QR Code...'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {isScanEvent ? 'Please wait while we process your scan' : 'Please wait while we load the QR code'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-4">
        <div className="text-center p-6 max-w-sm w-full mx-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <MdError className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            QR Code Error
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CommonOutlineButton
              text="Try Again"
              icon={<MdRefresh className="w-4 h-4" />}
              onClick={handleRetry}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
            />
            <CommonButton
              text="Go Home"
              icon={<FiHome className="w-4 h-4" />}
              onClick={handleGoHome}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  // If this is a scan event, show redirect page
  if (isScanEvent && qrData?.url) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-4">
        <div className="text-center p-6 max-w-lg w-full mx-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <MdCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-2">
            QR Code Scanned Successfully!
          </h1>
          
          <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <MdCheckCircle className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm font-medium">Scan recorded successfully! Analytics updated.</span>
          </div>
          
          <p className="text-sm sm:text-base text-black dark:text-white mb-4 sm:mb-6">
            You will be redirected to the destination URL
          </p>

          {/* Redirect URL Display */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-purple-200 dark:border-purple-800 mb-4 sm:mb-6">
            <div className="flex items-center justify-center mb-4">
              <FiExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-purple-900 dark:text-purple-100">
                Redirecting to Destination
              </h3>
            </div>
            
            <div className="p-3 sm:p-4 bg-white dark:bg-customBlack rounded-lg border border-purple-200 dark:border-purple-700 mb-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                Target URL:
              </p>
              <p className="text-purple-600 dark:text-purple-400 break-all text-xs sm:text-sm font-mono text-center bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded border border-purple-200 dark:border-purple-700">
                {qrData.url}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mb-3">
                ⏱️ Auto-redirecting in <span className="font-bold">{redirectCountdown} seconds</span>
              </p>
              <CommonButton
                text="Go Now"
                icon={<FiExternalLink className="w-4 h-4" />}
                onClick={handleRedirect}
                className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
              />
            </div>
          </div>

          <div className="text-center">
            <CommonOutlineButton
              text="Go Home Instead"
              icon={<FiHome className="w-4 h-4" />}
              onClick={handleGoHome}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  // If this is a scan event but no URL, show just the code ID
  if (isScanEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-customBrown dark:to-customBlack flex items-center justify-center p-4">
        <div className="text-center p-6 max-w-lg w-full mx-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <MdCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-2">
            QR Code Scanned Successfully!
          </h1> 
          
          <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <MdCheckCircle className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm font-medium">Scan recorded successfully! Analytics updated.</span>
          </div>
          
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Here is your QR Code ID:
          </p>

          {/* QR Code ID Display */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-purple-200 dark:border-purple-800 mb-4 sm:mb-6">
            <div className="flex items-center justify-center mb-4">
              <MdQrCode2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mr-2 sm:mr-3" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900 dark:text-purple-100">
                QR Code ID
              </h3>
            </div>
            
            <div className="p-4 sm:p-6 bg-white dark:bg-customBlack rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-700 mb-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                Your Unique Code:
              </p>
              <div className="text-center">
                <div className="inline-block bg-purple-100 dark:bg-purple-900/30 px-4 sm:px-8 py-4 sm:py-6 rounded-xl sm:rounded-2xl border-2 border-purple-300 dark:border-purple-600">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400 font-mono tracking-wider">
                    {qrId}
                  </p>
                </div>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300 text-center mt-3">
                This is your unique QR code identifier
              </p>
            </div>
            
            <div className="text-center">
              <CommonButton
                text="Copy Code"
                icon={<FiCopy className="w-4 h-4" />}
                onClick={() => {
                  navigator.clipboard.writeText(qrId);
                  toast.success('Code copied to clipboard!');
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
              />
            </div>
          </div>

          {/* Additional Info */}
          {qrData && (
            <div className="bg-white dark:bg-customBrown rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-customBorderColor mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                QR Code Details
              </h3>
              
              {qrData.name && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-customBlack rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name:</p>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{qrData.name}</p>
                </div>
              )}
              
              {qrData.messageForCustomer && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Message:</p>
                  <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">{qrData.messageForCustomer}</p>
                </div>
              )}
              
              {qrData.directMessage && (
                <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Direct Message:</p>
                  <p className="text-sm sm:text-base text-purple-800 dark:text-purple-200">{qrData.directMessage}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <CommonOutlineButton
              text="Go Home"
              icon={<FiHome className="w-4 h-4" />}
              onClick={handleGoHome}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  // If this is a display event (business owner viewing), show QR code display
  return (
    <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-4">
      <div className="text-center p-6 max-w-lg w-full mx-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <MdQrCode2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        
        <h1 className="text-14 sm:text-18 lg:text-20 font-bold text-black dark:text-white mb-2">
          QR Code Display
        </h1>
        
        <p className="text-10 sm:text-12 text-black dark:text-white mb-4 sm:mb-6">
          Scan this QR code with your mobile device or camera app
        </p>

        {qrData && (
          <div className="bg-white dark:bg-customBrown rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-customBorderColor mb-4 sm:mb-6">
            <div className="flex items-center justify-center mb-4">
              <MdQrCode2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mr-2 sm:mr-3" />
              <h3 className="text-14 sm:text-18 lg:text-20 font-semibold text-gray-900 dark:text-white">
                {qrData.name || 'QR Code Details'}
              </h3>
            </div>
            
            {/* QR Code Display */}
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-50 dark:bg-customBlack rounded-lg sm:rounded-xl border border-gray-200 dark:border-customBorderColor">
              <h4 className="text-sm sm:text-base font-medium text-black dark:text-white mb-3 text-center">
                QR Code for Scanning
              </h4>
              <div className="flex justify-center">
                {qrData.qrCodeImage ? (
                  <img 
                    src={qrData.qrCodeImage} 
                    alt="QR Code" 
                    className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 border-2 border-gray-300 dark:border-customBorderColor rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-white dark:bg-customBlack border-2 border-gray-300 dark:border-customBorderColor rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-center">
                      <MdQrCode2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        QR Code Image
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {qrData.qrData || qrData.qrdata || 'QR Data Available'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                Scan this QR code with another device to share
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-4">
                <CommonOutlineButton
                  text="Copy QR Data"
                  icon={<FiCopy className="w-4 h-4" />}
                  onClick={handleCopyQRData}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg"
                />
                {qrData?.qrCodeImage && (
                  <CommonOutlineButton
                    text="Download QR"
                    icon={<MdDownload className="w-4 h-4" />}
                    onClick={handleDownloadQR}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg"
                  />
                )}
              </div>
            </div>
            
            {/* QR Code Content Display */}
            <div className="mb-4 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 text-center text-sm sm:text-base">
                  🔑 QR Code Contains:
                </h4>
                <p className="text-purple-600 dark:text-purple-400 break-all text-xs sm:text-sm font-mono text-center bg-white dark:bg-customBlack p-2 sm:p-3 rounded border border-purple-200 dark:border-purple-700">
                  {qrId}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 text-center mt-2">
                  {qrData?.url ? 
                    'When scanned, users will be redirected to the target URL' : 
                    'When scanned, users will see this code ID'
                  }
                </p>
              </div>
            
            {/* Target URL Display (if exists) */}
            {qrData?.url && (
              <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 text-center text-sm sm:text-base">
                  🎯 Target URL:
                </h4>
                <div className="relative">
                  <p className="text-green-800 dark:text-green-200 break-all text-xs sm:text-sm font-mono text-center bg-white dark:bg-customBlack p-2 sm:p-3 rounded border border-green-200 dark:border-green-700 pr-12">
                    {qrData.url}
                  </p>
                  <button
                    onClick={() => window.open(qrData.url, '_blank')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 hover:bg-green-100 dark:hover:bg-green-800/30 rounded transition-colors"
                    title="Click to visit this URL"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 text-center mt-2">
                  Users will be redirected here when scanning
                </p>
              </div>
            )}
            
            {qrData.messageForCustomer && (
              <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 text-sm sm:text-base">
                  Message for customers:
                </h4>
                <p className="text-sm sm:text-base text-green-800 dark:text-green-200">
                  {qrData.messageForCustomer}
                </p>
              </div>
            )}
            
            {qrData.directMessage && (
              <div className="mb-4 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 text-sm sm:text-base">
                  Direct Message:
                </h4>
                <p className="text-sm sm:text-base text-purple-800 dark:text-purple-200">
                  {qrData.directMessage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Live Analytics Display */}
        <div className="bg-white dark:bg-customBrown rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-customBorderColor mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-4">
            <MdAnalytics className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg">
              Live Analytics
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                {qrData?.analytics?.totalScans || qrData?.scanCount || 0}
              </div>
              <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                Total Scans
              </div>
            </div>
            
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {qrData?.analytics?.totalShares || qrData?.sharedCount || qrData?.shareCount || 0}
              </div>
              <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                Total Shares
              </div>
            </div>
          </div>
          
          {/* Additional Analytics Info */}
          {qrData?.analytics && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gray-50 dark:bg-customBlack rounded-lg text-center">
                <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                  {qrData.analytics.averageScansPerDay || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Avg Scans/Day
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 dark:bg-customBlack rounded-lg text-center">
                <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                  {qrData.analytics.daysSinceCreation || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Days Active
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 dark:bg-customBlack rounded-lg text-center">
                <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                  {qrData.analytics.uniqueUsers || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Unique Users
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-2 sm:p-3 bg-gray-50 dark:bg-customBlack rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              📊 Analytics update in real-time when QR code is scanned
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {qrData?.url ? (
            <>
              <p className="text-sm sm:text-base text-black dark:text-white mb-4">
                This QR code will redirect users to the target URL when scanned
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <CommonButton
                  text="Test Target URL"
                  icon={<FiExternalLink className="w-4 h-4" />}
                  onClick={() => window.open(qrData.url, '_blank')}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
                />
                <CommonOutlineButton
                  text="Go Home"
                  icon={<FiHome className="w-4 h-4" />}
                  onClick={handleGoHome}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                This QR code contains the code ID and will record analytics when scanned.
              </p>
              <CommonButton
                text="Go Home"
                icon={<FiHome className="w-4 h-4" />}
                onClick={handleGoHome}
                className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default QRScanHandler;
