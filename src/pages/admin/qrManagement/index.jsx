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
    directMessage: ''
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
          directMessage: ''
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

              <CommonButton
                text={loading ? t.generating : t.generateQRCode}
                onClick={handleGenerateQR}
                className="rounded-xl w-full py-3"
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
              className="!py-2.5 !text-15 w-auto rounded-xl px-4 py-2"
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