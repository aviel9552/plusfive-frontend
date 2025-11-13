import React from 'react'
import { IoCopy } from 'react-icons/io5'
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { getAdminReferralTranslations } from '../../utils/translations';
import { useSelector } from 'react-redux';

function ReferralCode() {
  const { user } = useSelector((state) => state.auth)
  const referralCode = user?.referralCode || 'PLUSFIVE2025'
  const { language } = useLanguage();
  const t = getAdminReferralTranslations(language);

  const handleCopy = async (text) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(t.copiedToClipboard);
      } else {
        // Fallback method for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          toast.success(t.copiedToClipboard);
        } else {
          toast.error(t.failedToCopyToClipboard);
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(t.failedToCopyToClipboard);
    }
  }

  return (
    <div className="">
      <div className="flex flex-col gap-[24px] dark:bg-customBrown bg-white border border-gray-200 dark:border-commonBorder rounded-2xl p-6 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
        <h2 className="text-24 font-medium text-gray-900 dark:text-white font-ttcommons">
          {t.myReferralCode}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[72px]">
          {/* Referral Code */}
          <div className='flex flex-col gap-[6px]'>
            <p className="text-14 dark:text-white text-black">
              {t.referralCode}
            </p>
            <div className="flex items-center gap-2 ">
              <div className="border text-16 dark:border-commonBorder border-gray-200 flex-1 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg px-4 py-3 text-gray-900 dark:text-white font-medium">
                {referralCode}
              </div>
              <button
                onClick={() => handleCopy(referralCode)}
                className="
                  p-3 bg-gray-50 dark:bg-[#1C1C1C] text-gray-700 dark:text-white rounded-lg
                  hover:bg-gray-100 dark:hover:bg-[#2C2C2C] transition-colors duration-200
                  active:scale-95
                  border dark:border-commonBorder border-gray-200
                "
                title={t.copyReferralCode}
              >
                <IoCopy size={18} />
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div className='flex flex-col gap-[6px]'>
            <p className="text-14 dark:text-white text-black">
              {t.referralLink}
            </p>
            <div className="flex items-center gap-2">
              <div className="border text-16 dark:border-commonBorder border-gray-200 flex-1 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg px-4 py-3 text-gray-900 dark:text-white font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                {import.meta.env.VITE_APP_URL}/ref/{referralCode}
              </div>
              <button
                onClick={() => handleCopy(`${import.meta.env.VITE_APP_URL}/ref/${referralCode}`)}
                className="
                  p-3 bg-gray-50 dark:bg-[#1C1C1C] text-gray-700 dark:text-white rounded-lg
                  hover:bg-gray-100 dark:hover:bg-[#2C2C2C] transition-colors duration-200
                  active:scale-95
                  border dark:border-commonBorder border-gray-200
                "
                title={t.copyReferralLink}
              >
                <IoCopy size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReferralCode
