import React from 'react'
import { MdWarning, MdClose } from 'react-icons/md'
import { useLanguage } from '../../context/LanguageContext';

const CommonConfirmModel = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  confirmButtonColor = "bg-gradient-to-r from-customRed to-orange-500 hover:from-orange-500 hover:to-customRed focus:ring-2 focus:ring-orange-400",
  cancelButtonColor = "bg-customGray2 dark:bg-customIconBgColor hover:bg-gray-400 dark:hover:bg-customBorderColor focus:ring-2 focus:ring-gray-400",
  confirmButtonTextColor = "text-white",
  cancelButtonTextColor = "text-gray-700 dark:text-white"
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'he';

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={handleCancel}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white/90 dark:bg-customBlack/90 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden backdrop-blur-md border border-customGray2 dark:border-customGray flex flex-col animate-fadeIn">
        {/* Header with Icon */}
        <div className={`px-8 pt-6 pb-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'} ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-customRed to-orange-400 dark:from-customRed dark:to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <MdWarning className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-customGray focus:outline-none focus:ring-2 focus:ring-customRed"
            aria-label="Close"
          >
            <MdClose size={20} />
          </button>
        </div>
        {/* Divider */}
        <div className="border-t border-b border-customGray2 dark:border-customGray mx-8" />
        {/* Body */}
        <div className="px-8 py-6">
          <p className="text-base text-gray-700 dark:text-customWhite leading-relaxed">
            {message}
          </p>
        </div>
        {/* Footer */}
        <div className={`px-8 py-6 bg-gray-50/80 dark:bg-customGray/80 flex justify-end gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={handleCancel}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${cancelButtonColor} ${cancelButtonTextColor}`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-lg transition-all duration-200 ${confirmButtonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommonConfirmModel