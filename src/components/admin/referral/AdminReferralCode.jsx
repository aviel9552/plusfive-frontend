import React from 'react'
import { IoCopy } from 'react-icons/io5'

function AdminReferralCode() {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // You can add a toast notification here
        console.log('Copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy:', err)
      })
  }

  return (
    <div className="">
      <div className="dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl p-6 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
          My Referral Code
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Code */}
          <div>
            <p className="text-sm dark:text-white text-black mb-2">
              Referral Code
            </p>
            <div className="flex items-center gap-2 ">
              <div className="border dark:border-customBorderColor border-gray-200 flex-1 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg px-4 py-3 text-gray-900 dark:text-white font-medium">
                PLUSFIVE2025
              </div>
              <button 
                onClick={() => handleCopy('PLUSFIVE2025')}
                className="
                  p-3 bg-gray-50 dark:bg-[#1C1C1C] text-gray-700 dark:text-white rounded-lg
                  hover:bg-gray-100 dark:hover:bg-[#2C2C2C] transition-colors duration-200
                  active:scale-95
                  border dark:border-customBorderColor border-gray-200
                "
                title="Copy referral code"
              >
                <IoCopy size={18} />
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <p className="text-sm dark:text-white text-black mb-2">
              Referral Link
            </p>
            <div className="flex items-center gap-2">
              <div className="border dark:border-customBorderColor border-gray-200 flex-1 bg-gray-50 dark:bg-[#1C1C1C] rounded-lg px-4 py-3 text-gray-900 dark:text-white font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                https://plusfive.io/ref/plusfive2025
              </div>
              <button 
                onClick={() => handleCopy('https://plusfive.io/ref/plusfive2025')}
                className="
                  p-3 bg-gray-50 dark:bg-[#1C1C1C] text-gray-700 dark:text-white rounded-lg
                  hover:bg-gray-100 dark:hover:bg-[#2C2C2C] transition-colors duration-200
                  active:scale-95
                  border dark:border-customBorderColor border-gray-200
                "
                title="Copy referral link"
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

export default AdminReferralCode
