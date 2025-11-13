import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiCreditCard, FiLock, FiShield, FiAlertCircle } from 'react-icons/fi';
import { GoShieldLock } from "react-icons/go";
import { CommonButton, CommonCustomOutlineButton, CommonInput, CommonNormalDropDown } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { toast } from 'react-toastify';

// Safely load Stripe with error handling
const stripePromise = (() => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey || publishableKey === 'undefined') {
    console.warn('⚠️ VITE_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
    return null;
  }
  
  try {
    return loadStripe(publishableKey);
  } catch (error) {
    console.error('❌ Failed to load Stripe:', error);
    return null;
  }
})();

// Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      // color: '#374151',
      color: '#fff',
      fontFamily: 'inherit',
      '::placeholder': {
        // color: '#9CA3AF', // text-gray-400
        color: '#fff', // text-gray-400
      },
      iconColor: '#EC4899', // text-pink-500
    },
    invalid: {
      color: '#DC2626', // text-red-600
      iconColor: '#DC2626',
    },
  },
};

// Main Payment Form Component
function PaymentForm({ onSubmit, onCancel, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const t = getUserCardTranslations(language);
  
  const [formData, setFormData] = useState({
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });
  
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle card element change
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe is not loaded. Please refresh the page.');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!cardComplete) {
      toast.error('Please complete the card information.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment method using Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: formData.cardholderName,
          address: {
            line1: formData.billingAddress,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to create payment method');
        return;
      }

      // Call the onSubmit callback with the payment method
      if (onSubmit) {
        await onSubmit({
          paymentMethodId: paymentMethod.id,
          cardholderName: formData.cardholderName,
          billingAddress: formData.billingAddress,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
        });
      }

      // Show success message
      toast.success('Payment method added successfully!');
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Payment method creation error:', error);
      toast.error('Failed to add payment method. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Information Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Card Information <span className="text-red-500">*</span>
          </label>
          <div className="w-full border border-gray-200 dark:border-customBorderColor rounded-lg px-4 py-3 bg-customBody dark:bg-customBrown focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500 transition-all duration-200">
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
              className="min-h-[24px]"
            />
          </div>
        </div>

        <div>
          <CommonInput
            label="Cardholder Name"
            id="cardholderName"
            name="cardholderName"
            value={formData.cardholderName}
            onChange={handleInputChange}
            placeholder="Name as it appears on card"
            error={errors.cardholderName}
            labelFontSize="text-sm"
          />
        </div>
      </div>

      {/* Billing Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing Address</h3>
        
        <div>
          <CommonInput
            label="Address"
            id="billingAddress"
            name="billingAddress"
            value={formData.billingAddress}
            onChange={handleInputChange}
            placeholder="Street address"
            error={errors.billingAddress}
            labelFontSize="text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CommonInput
              label="City"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              error={errors.city}
              labelFontSize="text-sm"
            />
          </div>

          <div>
            <CommonInput
              label="State/Province"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="State"
              labelFontSize="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CommonInput
              label="Postal Code"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Postal code"
              error={errors.postalCode}
              labelFontSize="text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Country
            </label>
            <CommonNormalDropDown
              options={[
                { value: 'US', label: 'United States' },
                { value: 'CA', label: 'Canada' },
                { value: 'GB', label: 'United Kingdom' },
                { value: 'AU', label: 'Australia' },
                { value: 'DE', label: 'Germany' },
                { value: 'FR', label: 'France' },
                { value: 'IN', label: 'India' },
                { value: 'JP', label: 'Japan' }
              ]}
              value={formData.country}
              className='!h-[50px]'
              onChange={(value) => handleInputChange({ target: { name: 'country', value } })}
              placeholder="Select country"
              fontSize="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <GoShieldLock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Secure Payment Processing</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Your payment information is encrypted and securely processed by Stripe. 
              We never store your full card details on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4">
        <CommonButton
          text={isProcessing ? "Adding..." : "Add Payment Method"}
          type="submit"
          disabled={!stripe || isProcessing || !cardComplete}
          icon={<FiCreditCard />}
          className="flex-1 !text-white rounded-lg py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <CommonCustomOutlineButton
          text="Cancel"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 rounded-lg py-3 text-lg"
          borderColor="border-gray-300 dark:border-gray-600"
        />
      </div>
    </form>
  );
}

// Wrapper component with Stripe Elements
function StripePaymentForm({ onSubmit, onCancel, onSuccess }) {
  // Show error message if Stripe is not properly configured
  if (!stripePromise) {
    return (
      <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
        <div className="text-center py-8">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Stripe Configuration Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Stripe is not properly configured. Please contact support or check your environment variables.
          </p>
          <CommonCustomOutlineButton
            text="Go Back"
            onClick={onCancel}
            className="px-6 py-2"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <div className="flex items-center mb-8 gap-4">
        {/* <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
          <FiCreditCard className="text-white text-xl" />
        </div> */}
        <div>
          {/* <p className="text-gray-600 dark:text-gray-400">Securely add a new credit or debit card</p> */}
        </div>
      </div>

      <Elements stripe={stripePromise}>
        <PaymentForm 
          onSubmit={onSubmit} 
          onCancel={onCancel} 
          onSuccess={onSuccess}
        />
      </Elements>
    </div>
  );
}

export default StripePaymentForm;
