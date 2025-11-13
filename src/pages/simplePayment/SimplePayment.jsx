import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CommonButton } from '../../components';
import { useLanguage } from '../../context/LanguageContext';
import { createSimpleCheckout } from '../../redux/services/simplePaymentServices';

function SimplePayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const description = searchParams.get('description');

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const paymentData = {
        amount: parseFloat(amount),
        currency: currency,
        description: description,
        successUrl: `${window.location.origin}/app/payment-success`,
        cancelUrl: `${window.location.origin}/app/payment-cancel`
      };

      const result = await createSimpleCheckout(paymentData);

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        alert(result.error || 'Payment URL not received. Please try again.');
      }
      
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Payment Icon */}
        <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>

        {/* Payment Details */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Simple Payment
        </h1>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Payment Details
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            <span className="font-medium">Amount:</span> {amount} {currency.toUpperCase()}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            <span className="font-medium">Description:</span> {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <CommonButton
            text={loading ? 'Processing...' : `Pay ${amount} ${currency.toUpperCase()}`}
            onClick={handlePayment}
            className="w-full !py-3 !text-16"
            disabled={loading}
          />

          <CommonButton
            text="Cancel"
            onClick={handleCancel}
            className="w-full !py-3 !text-16 bg-gray-600 hover:bg-gray-700"
          />
        </div>

        {/* Security Notice */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          🔒 Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}

export default SimplePayment;
