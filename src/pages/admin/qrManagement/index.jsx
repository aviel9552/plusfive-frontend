import React, { useState } from 'react';
import { CommonButton, CommonOutlineButton, AdminReportsandAnalyticsTitle, CommonInput } from "../../../components";
import { createQRCodeWithUserInfo } from '../../../redux/services/qrServices';
import { PiShareFatBold } from 'react-icons/pi';
import { MdQrCode2 } from 'react-icons/md';
import { LuDownload } from 'react-icons/lu';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminQRTranslations } from '../../../utils/translations';
import { toast } from 'react-toastify';

function AdminQRManagement() {
  const { language } = useLanguage();
  const t = getAdminQRTranslations(language);
  
  const [formData, setFormData] = useState({
    customerMessage: '',
    directMessage: '',
    targetUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation for customer message
    if (name === 'customerMessage') {
      if (!value) {
        setErrors(prev => ({ ...prev, customerMessage: "" }));
      } else if (value.trim().length < 10) {
        setErrors(prev => ({ ...prev, customerMessage: t.customerMessageMinLength }));
      } else {
        setErrors(prev => ({ ...prev, customerMessage: "" }));
      }
    }
    
    // Real-time validation for direct message
    else if (name === 'directMessage') {
      if (!value) {
        setErrors(prev => ({ ...prev, directMessage: "" }));
      } else if (value.trim().length < 10) {
        setErrors(prev => ({ ...prev, directMessage: t.directMessageMinLength }));
      } else {
        setErrors(prev => ({ ...prev, directMessage: "" }));
      }
    }
    
    // Clear other field errors
    else if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    // Show validation error immediately when user focuses on field
    if (name === 'customerMessage') {
      if (!formData.customerMessage) {
        setErrors(prev => ({ ...prev, customerMessage: t.customerMessageRequired }));
      } else if (formData.customerMessage.trim().length < 10) {
        setErrors(prev => ({ ...prev, customerMessage: t.customerMessageMinLength }));
      }
    } else if (name === 'directMessage') {
      if (!formData.directMessage) {
        setErrors(prev => ({ ...prev, directMessage: t.directMessageRequired }));
      } else if (formData.directMessage.trim().length < 10) {
        setErrors(prev => ({ ...prev, directMessage: t.directMessageMinLength }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate on blur
    if (name === 'customerMessage') {
      if (!value) {
        setErrors(prev => ({ ...prev, customerMessage: t.customerMessageRequired }));
      } else if (value.trim().length < 10) {
        setErrors(prev => ({ ...prev, customerMessage: t.customerMessageMinLength }));
      }
    } else if (name === 'directMessage') {
      if (!value) {
        setErrors(prev => ({ ...prev, directMessage: t.directMessageRequired }));
      } else if (value.trim().length < 10) {
        setErrors(prev => ({ ...prev, directMessage: t.directMessageMinLength }));
      }
    } else if (name === 'targetUrl') {
      if (value && !isValidUrl(value)) {
        setErrors(prev => ({ ...prev, targetUrl: 'Please enter a valid URL' }));
      } else {
        setErrors(prev => ({ ...prev, targetUrl: '' }));
      }
    }
  };

  // Helper function to validate URLs
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerMessage.trim()) {
      newErrors.customerMessage = t.customerMessageRequired;
    } else if (formData.customerMessage.trim().length < 10) {
      newErrors.customerMessage = t.customerMessageMinLength;
    }
    
    if (!formData.directMessage.trim()) {
      newErrors.directMessage = t.directMessageRequired;
    } else if (formData.directMessage.trim().length < 10) {
      newErrors.directMessage = t.directMessageMinLength;
    }
    
    // URL validation (optional field)
    if (formData.targetUrl && !isValidUrl(formData.targetUrl)) {
      newErrors.targetUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateQR = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Prepare API data with static and dynamic fields
      const qrData = {
        name: t.myBusinessQRCode,
        messageForCustomer: formData.customerMessage.trim(),
        directMessage: formData.directMessage.trim(),
        targetUrl: formData.targetUrl.trim() || null, // Include target URL if provided
        size: 300,
        color: "#000000",
        backgroundColor: "#FFFFFF"
      };

      // Direct API call instead of Redux action
      const response = await createQRCodeWithUserInfo(qrData);
      
      if (response && response.data) {
        setGeneratedQR(response.data);
        // Clear form after successful generation
        setFormData({
          customerMessage: '',
          directMessage: '',
          targetUrl: ''
        });
        setErrors({});
        // Show success toast with API message
        toast.success(response.message || t.qrCodeGeneratedSuccessfully);
      } else {
        toast.error(t.failedToGenerateQRCode);
      }
    } catch (error) {
      toast.error(t.errorGeneratingQRCode);
    } finally {
      setLoading(false);
    }
  };

  // Download QR Code functionality
  const handleDownloadQR = () => {
    if (!generatedQR || !generatedQR.qrCodeImage) {
      toast.error(t.noQRCodeToDownload);
      return;
    }

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = generatedQR.qrCodeImage;
      link.download = `${generatedQR.name || 'QRCode'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t.qrCodeDownloadedSuccessfully);
    } catch (error) {
      toast.error(t.failedToDownloadQRCode);
    }
  };

  // Share QR Code on WhatsApp functionality
  const handleShareWhatsApp = () => {
    if (!generatedQR) {
      toast.error(t.noQRCodeToShare);
      return;
    }

    try {
      // Create WhatsApp share URL with QR code data
      const shareText = `${generatedQR.qrData}`;
      const whatsappURL = `https://api.whatsapp.com/send?text=/${encodeURIComponent(shareText)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappURL, '_blank');
      toast.success(t.qrCodeSharedSuccessfully);
    } catch (error) {
      toast.error(t.failedToShareQRCode);
    }
  };

  return (
    <div className="">
      {/* Main content boxes */}
      <div className="dark:bg-customBrown bg-white rounded-2xl border dark:border-gray-800 border-gray-200 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* QR Generator Section */}
          <div className='md:p-8 p-0 dark:text-white text-black dark:bg-customBrown bg-customBody rounded-2xl md:border dark:border-gray-800 border-gray-200'>
            <h2 className="text-22 font-medium mb-8">
              {t.qrGenerator}
            </h2>
            <div className="space-y-6">
              <CommonInput
                label={t.messageForCustomer}
                id="customerMessage"
                name="customerMessage"
                value={formData.customerMessage}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                showErrorOnFocus={true}
                placeholder={t.messageForCustomerPlaceholder}
                error={errors.customerMessage}
                labelFontSize="text-15"
              />

              <CommonInput
                label={t.directMessage}
                id="directMessage"
                name="directMessage"
                value={formData.directMessage}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                showErrorOnFocus={true}
                placeholder={t.directMessagePlaceholder}
                error={errors.directMessage}
                labelFontSize="text-15"
              />

              <CommonInput
                label={t.targetUrl}
                id="targetUrl"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                showErrorOnFocus={true}
                placeholder={t.targetUrlPlaceholder}
                error={errors.targetUrl}
                labelFontSize="text-15"
              />

              <CommonButton
                text={loading ? t.generating : t.generateQRCode}
                onClick={handleGenerateQR}
                className="rounded-xl w-full py-3 text-14"
                disabled={loading}
              />
            </div>
          </div>

          {/* QR Code Display Section */}
          <div className='md:p-8 p-0 dark:text-white text-black dark:bg-customBrown bg-white rounded-2xl md:border dark:border-gray-800 border-gray-200'>
            <h2 className="text-22 font-medium mb-8">
              {t.myQRCodes}
            </h2>
            <div className="md:p-0 p-10 flex flex-col items-center justify-center h-[320px] rounded-lg dark:bg-customBrown bg-customBody border dark:border-gray-800 border-gray-200 border-dashed">
              {generatedQR ? (
                <div className="text-center">
                  <img 
                    src={generatedQR.qrCodeImage} 
                    alt="Generated QR Code"
                    className="w-48 h-48 mx-auto mb-4 border border-gray-300 rounded-lg"
                  />
                  <p className="dark:text-white text-black text-16 font-medium">
                    {generatedQR.name}
                  </p>
                  <p className="dark:text-gray-400 text-gray-600 text-14 mt-2">
                    {t.qrCodeGeneratedSuccessfully}
                  </p>
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">QR Data:</p>
                      <p className="text-gray-900 dark:text-white break-all text-sm font-mono">
                        {generatedQR.qrData}
                      </p>
                    </div>
                    {generatedQR.targetUrl && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">Target URL:</p>
                        <p className="text-green-800 dark:text-green-200 break-all text-sm font-mono">
                          {generatedQR.targetUrl}
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Customer Message:</p>
                      <p className="text-blue-800 dark:text-blue-200">
                        {generatedQR.messageForCustomer}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Direct Message:</p>
                      <p className="text-purple-800 dark:text-purple-200">
                        {generatedQR.directMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <MdQrCode2 className="text-6xl dark:text-white text-black mb-4" />
                  <p className="dark:text-white text-black text-18">
                    {t.generatedQRCodesWillAppearHere}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='px-8 pb-8'>
          {/* Action Buttons */}
          <div className="flex gap-3 md:flex-row flex-col">
            <CommonButton
              text={t.downloadQRCode}
              className="py-2.5 w-auto rounded-xl px-4 text-14"
              icon={<LuDownload className="text-lg font-bold" />}
              disabled={!generatedQR}
              onClick={handleDownloadQR}
            />
            <CommonOutlineButton
              text={t.shareWhatsApp}
              className="!py-2.5 !text-15 w-auto rounded-xl"
              icon={<PiShareFatBold className="text-lg" />}
              disabled={!generatedQR}
              onClick={handleShareWhatsApp}
            />
          </div>
        </div>
      </div>
      <div className="dark:bg-customBrown bg-white rounded-2xl border dark:border-gray-800 border-gray-200 p-8 mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <AdminReportsandAnalyticsTitle />
      </div>
    </div>
  );
}

export default AdminQRManagement; 