import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiCreditCard, FiLock, FiShield, FiAlertCircle } from 'react-icons/fi';
import { GoShieldLock } from "react-icons/go";
import { CommonButton, CommonCustomOutlineButton } from '../index';
import { useLanguage } from '../../context/LanguageContext';
import { getUserCardTranslations } from '../../utils/translations';
import { toast } from 'react-toastify';

// Load Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#6772e5',
    },
    invalid: {
      color: '#9e2146',
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Information <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
              className="min-h-[40px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cardholder Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="cardholderName"
            value={formData.cardholderName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              errors.cardholderName 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Name as it appears on card"
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
          )}
        </div>
      </div>

      {/* Billing Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing Address</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="billingAddress"
            value={formData.billingAddress}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              errors.billingAddress 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Street address"
          />
          {errors.billingAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.city 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="City"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State/Province
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="State"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.postalCode 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Postal code"
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IN">India</option>
              <option value="JP">Japan</option>
            </select>
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
  return (
    <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <div className="flex items-center mb-8 gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
          <FiCreditCard className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Add Payment Method</h2>
          <p className="text-gray-600 dark:text-gray-400">Securely add a new credit or debit card</p>
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
