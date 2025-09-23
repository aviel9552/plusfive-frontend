import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { CommonButton } from '../../components';
import { updatePaymentStatus, getPaymentHistory } from '../../redux/services/simplePaymentServices';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get('session_id');

  // Update payment status on success
  useEffect(() => {
    const handlePaymentStatusUpdate = async () => {
      if (sessionId) {
        try {
          const result = await updatePaymentStatus(sessionId);
          if (result.success) {
            // Fetch updated payment history
            await getPaymentHistory();
          }
        } catch (error) {
          // Silent error handling
        }
      }
    };

    handlePaymentStatusUpdate();
  }, [sessionId]);


  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [countdown, navigate]);

  const handleGoToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
          <FaCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Successful!
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
          Thank you for your payment!
        </p>

        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Your payment has been processed successfully. You can now continue using our services.
        </p>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Session ID: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">{sessionId}</code>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <CommonButton
            text="Go to Dashboard"
            onClick={handleGoToDashboard}
            className="w-full !py-3 !text-16"
            icon={<FaArrowRight className="ml-2" />}
          />
        </div>

        {/* Auto-redirect notice */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Redirecting to dashboard in <span className="font-semibold">{countdown}</span> seconds
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccess;
