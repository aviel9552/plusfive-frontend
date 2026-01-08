import React from 'react';
import { MdQrCode2 } from 'react-icons/md';

function QRCodePage() {
  return (
    <div className="bg-[#1B1B1B] rounded-2xl p-8">
      <h2 className="text-22 text-white font-medium mb-8">My QR Codes</h2>
      
      <div className="flex flex-col items-center justify-center h-[320px] rounded-lg bg-[#232323]">
        <MdQrCode2 className="text-6xl text-gray-600 mb-4" />
        <p className="text-gray-400 text-15">
          Generated QR codes will appear here
        </p>
      </div>
    </div>
  );
}

export default QRCodePage; 