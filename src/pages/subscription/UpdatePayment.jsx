import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonButton, CommonCustomOutlineButton } from '../../components';
import { CgCreditCard } from 'react-icons/cg';
import { MdArrowBack, MdSecurity, MdInfo, MdCheckCircle, MdWarning } from 'react-icons/md';
import { useStripeSubscription } from '../../hooks/useStripeSubscription';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe configuration
// Make sure to set VITE_STRIPE_PUBLISHABLE_KEY in your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe Card Form Component
const StripeCardForm = ({ onSubmit, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe is not loaded. Please refresh the page.');
      return;
    }

    if (!cardholderName.trim()) {
      toast.error('Please enter the cardholder name');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment method using Stripe Elements
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to create payment method');
        return;
      }

      // Call the parent onSubmit with the payment method ID
      await onSubmit({
        paymentMethodId: paymentMethod.id,
        cardholderName: cardholderName,
        cardType: paymentMethod.card?.brand || 'Unknown'
      });

    } catch (error) {
      console.error('Payment method creation failed:', error);
      toast.error('Failed to create payment method. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#EF4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cardholder Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          maxLength={50}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Name as it appears on your card
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Card Details <span className="text-red-500">*</span>
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter your card information securely
        </p>
      </div>

      <div className="flex gap-3">
        <CommonButton
          text={isProcessing ? "Processing..." : "Add Payment Method"}
          type="submit"
          className="flex-1"
          disabled={isProcessing || !stripe}
        />
        <CommonCustomOutlineButton
          text="Cancel"
          onClick={onCancel}
          className="flex-1"
        />
      </div>
    </form>
  );
};

function UpdatePayment() {
  const navigate = useNavigate();
  const { handleOpenCustomerPortal } = useStripeSubscription();
  const { paymentMethods, loading: paymentMethodsLoading, handleAddPaymentMethod } = usePaymentMethods();
  
  const [isLoading, setIsLoading] = useState(false);
  const [useStripePortal, setUseStripePortal] = useState(true);
  const [showStripeForm, setShowStripeForm] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔍 UpdatePayment Debug Info:');
    console.log('paymentMethods:', paymentMethods);
    console.log('paymentMethods type:', typeof paymentMethods);
    console.log('paymentMethods isArray:', Array.isArray(paymentMethods));
    console.log('paymentMethodsLoading:', paymentMethodsLoading);
  }, [paymentMethods, paymentMethodsLoading]);

  const handleSecurePaymentMethod = async (paymentData) => {
    try {
      setIsLoading(true);
      
      // Call the backend to attach the payment method to the customer
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentMethodId: paymentData.paymentMethodId,
          cardholderName: paymentData.cardholderName,
          cardType: paymentData.cardType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Payment method added successfully!');
        // Refresh payment methods
        // You can call a refresh function here if needed
        setShowStripeForm(false);
      } else {
        throw new Error(result.message || 'Failed to add payment method');
      }
      
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error(error.message || 'Failed to add payment method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripePortal = async () => {
    try {
      setIsLoading(true);
      await handleOpenCustomerPortal();
    } catch (error) {
      toast.error('Failed to open payment portal');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/billing')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-4"
          >
            <MdArrowBack />
            Back to Billing
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Update Payment Information
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your payment methods and billing information securely
          </p>
        </div>

        {/* Professional Recommendation Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <MdInfo className="text-blue-600 dark:text-blue-400 text-sm" />
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium">
                                 <strong>Professional Recommendation:</strong> Use Stripe Elements for secure card input or the Stripe Customer Portal for comprehensive payment management.
              </p>
            </div>
          </div>
        </div>

                 {/* Current Payment Methods Summary */}
         {!paymentMethodsLoading && Array.isArray(paymentMethods) && paymentMethods.length > 0 && (
           <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <CgCreditCard className="text-blue-600 dark:text-blue-400 text-xl" />
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                 Current Payment Methods
               </h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {paymentMethods.slice(0, 2).map((pm) => (
                 <div key={pm.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                   <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                     <CgCreditCard className="text-blue-600 dark:text-blue-400 text-sm" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-900 dark:text-white">
                       {pm.brand || 'Card'} •••• {pm.last4 || '••••'}
                     </p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                       Expires {pm.expMonth}/{pm.expYear}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
             {paymentMethods.length > 2 && (
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                 +{paymentMethods.length - 2} more payment methods
               </p>
             )}
           </div>
         )}

         {/* Debug Payment Methods Data */}
         {!paymentMethodsLoading && (
           <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
             <p className="text-sm text-yellow-800 dark:text-yellow-300">
               <strong>Debug Info:</strong> paymentMethods type: {typeof paymentMethods}, 
               isArray: {Array.isArray(paymentMethods)}, 
               length: {Array.isArray(paymentMethods) ? paymentMethods.length : 'N/A'}
             </p>
             <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
               Raw data: {JSON.stringify(paymentMethods, null, 2)}
             </p>
           </div>
         )}

         {/* Fallback for non-array paymentMethods */}
         {!paymentMethodsLoading && !Array.isArray(paymentMethods) && (
           <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
             <div className="flex items-center gap-3">
               <MdWarning className="text-red-600 dark:text-red-400 text-xl" />
               <div>
                 <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                   Payment Methods Data Issue
                 </h3>
                 <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                   Expected array but received: {typeof paymentMethods}. Please check the API response structure.
                 </p>
               </div>
             </div>
           </div>
         )}

        {/* Payment Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Option 1: Stripe Customer Portal (Recommended) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <CgCreditCard className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Stripe Customer Portal
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enterprise-Grade Security
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MdCheckCircle className="text-green-500" />
                <span>Bank-level security & encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MdCheckCircle className="text-green-500" />
                <span>Manage all payment methods securely</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MdCheckCircle className="text-green-500" />
                <span>Update billing information instantly</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MdCheckCircle className="text-green-500" />
                <span>PCI DSS compliant</span>
              </div>
            </div>
            
            <CommonButton
              text={isLoading ? "Opening Portal..." : "Open Stripe Portal"}
              onClick={handleStripePortal}
              className="w-full"
              disabled={isLoading}
            />
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Redirects to Stripe's secure, industry-standard portal
            </p>
          </div>

          {/* Option 2: Custom Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CgCreditCard className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Secure Stripe Integration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PCI DSS Compliant Card Input
                </p>
              </div>
            </div>
            
            {!showStripeForm ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
                    <MdCheckCircle className="text-green-600 dark:text-green-400" />
                    <span>No sensitive card data touches our servers</span>
                  </div>
                </div>
                
                <CommonButton
                  text="Add Payment Method Securely"
                  onClick={() => setShowStripeForm(true)}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setShowStripeForm(false)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  >
                    ← Back to Options
                  </button>
                </div>
                
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    onSubmit={handleSecurePaymentMethod}
                    onCancel={() => setShowStripeForm(false)}
                  />
                </Elements>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MdSecurity className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold text-base mb-2">Enterprise-Grade Security & Privacy</p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <MdCheckCircle className="text-green-500 text-sm" />
                  <span>End-to-end encryption for all payment data</span>
                </p>
                <p className="flex items-center gap-2">
                  <MdCheckCircle className="text-green-500 text-sm" />
                  <span>PCI DSS Level 1 compliance maintained</span>
                </p>
                                 <p className="flex items-center gap-2">
                   <MdCheckCircle className="text-green-500 text-sm" />
                   <span>Stripe Elements handles all sensitive card data</span>
                 </p>
                <p className="flex items-center gap-2">
                  <MdCheckCircle className="text-green-500 text-sm" />
                  <span>Industry-standard secure payment gateways</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePayment;
