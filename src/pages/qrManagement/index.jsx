import React, { useState } from 'react';
import { CommonButton, CommonOutlineButton, ReportsandAnalyticsTitle } from "../../components";
import { PiShareFatBold } from 'react-icons/pi';
import { MdQrCode2 } from 'react-icons/md';
import { LuDownload } from 'react-icons/lu';

function QRManagement() {
  const [formData, setFormData] = useState({
    customerMessage: '',
    directMessage: '',
    targetUrl: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateQR = () => {
    console.log('Generating QR with:', formData);
    // TODO: Implement QR generation with URL support
    // The form now includes targetUrl field for future implementation
  };

  return (
    <div className="">
      {/* Main content boxes */}
      <div className="dark:bg-customBrown bg-white rounded-2xl border dark:border-commonBorder border-gray-200 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* QR Generator Section */}
          <div className='md:p-8 p-0 dark:text-white text-black dark:bg-customBrown bg-customBody rounded-2xl md:border dark:border-commonBorder border-gray-200'>
            <h2 className="text-22 font-medium mb-8">
              QR Generator
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-15 mb-3">
                  Message for Customer
                </label>
                <input
                  type="text"
                  name="customerMessage"
                  value={formData.customerMessage}
                  onChange={handleChange}
                  placeholder="The message your customer shares with friends..."
                  className="w-full dark:bg-customBrown bg-white border dark:border-commonBorder border-gray-200 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 text-15"
                />
              </div>

              <div >
                <label className="block text-15 mb-3">
                  Direct Message
                </label>
                <input
                  type="text"
                  name="directMessage"
                  value={formData.directMessage}
                  onChange={handleChange}
                  placeholder="The message your customer's friends will send you..."
                  className="w-full dark:bg-customBrown bg-white border dark:border-commonBorder border-gray-200 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 text-15"
                />
              </div>

              <div >
                <label className="block text-15 mb-3">
                  Target URL (Optional)
                </label>
                <input
                  type="url"
                  name="targetUrl"
                  value={formData.targetUrl}
                  onChange={handleChange}
                  placeholder="https://example.com or leave empty for code-only QR"
                  className="w-full dark:bg-customBrown bg-white border dark:border-commonBorder border-gray-200 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 text-15"
                />
              </div>

              <CommonButton
                text="Generate QR Code"
                onClick={handleGenerateQR}
                className="rounded-xl w-full py-3"
              />
            </div>
          </div>

          {/* QR Code Display Section */}
          <div className='md:p-8 p-0 dark:text-white text-black dark:bg-customBrown bg-white rounded-2xl md:border dark:border-commonBorder border-gray-200'>
            <h2 className="text-22 font-medium mb-8">
              My QR Codes
            </h2>
            <div className="md:p-0 p-10 flex flex-col items-center justify-center h-[320px] rounded-lg dark:bg-customBrown bg-customBody border dark:border-commonBorder border-gray-200 border-dashed">
              <MdQrCode2 className="text-6xl dark:text-white text-black mb-4" />
              <p className="dark:text-white text-black text-18">
                Generated QR codes will appear here
              </p>
            </div>
          </div>
        </div>

        <div className='px-8 pb-8'>
          {/* Action Buttons */}
          <div className="flex gap-3 md:flex-row flex-col">
            <CommonButton
              text="Download QR Code"
              className="!py-2.5 !text-14 w-auto rounded-xl px-4"
              icon={<LuDownload className="text-lg font-bold" />}
            />
            <CommonOutlineButton
              text="Share WhatsApp"
              className="!py-2.5 !text-14 w-auto rounded-xl"
              icon={<PiShareFatBold className="text-lg" />}
            />
          </div>
        </div>
      </div>
      <div className="dark:bg-customBrown bg-white rounded-2xl border dark:border-commonBorder border-gray-200 p-8 mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <ReportsandAnalyticsTitle />
      </div>
    </div>
  );
}

export default QRManagement; 