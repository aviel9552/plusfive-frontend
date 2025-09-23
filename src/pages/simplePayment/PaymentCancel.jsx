import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { CommonButton } from '../../components';

function PaymentCancel() {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/app/simple-payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Cancel Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <FaTimesCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Cancelled
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
          Your payment was cancelled
        </p>

        <p className="text-gray-500 dark:text-gray-400 mb-8">
          No charges were made to your account. You can try again anytime.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <CommonButton
            text="Try Again"
            onClick={handleTryAgain}
            className="w-full !py-3 !text-16"
          />

          <CommonButton
            text="Go to Dashboard"
            onClick={handleGoToDashboard}
            className="w-full !py-3 !text-16 bg-gray-600 hover:bg-gray-700"
            icon={<FaArrowLeft className="mr-2" />}
          />
        </div>

        {/* Help Notice */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Need help? Contact our support team
        </p>
      </div>
    </div>
  );
}

export default PaymentCancel;
