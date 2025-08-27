import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { CommonButton, CommonCustomOutlineButton } from '../index';
import { 
  CgCreditCard, 
  CgAdd, 
  CgPen, 
  CgTrash, 
  CgCheck 
} from 'react-icons/cg';
import { 
  MdSecurity, 
  MdInfo, 
  MdWarning, 
  MdStar, 
  MdStarBorder 
} from 'react-icons/md';
import { toast } from 'react-toastify';
import AddNewCreditCard from './AddNewCreditCard';

// Payment Method Card Component
const PaymentMethodCard = ({ 
  paymentMethod, 
  onEdit, 
  onRemove, 
  onSetDefault, 
  isDefault, 
  isRemoving 
}) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const getCardIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const maskCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  const handleRemove = () => {
    if (isDefault) {
      toast.error('Cannot remove default payment method. Set another as default first.');
      return;
    }
    setShowRemoveConfirm(true);
  };

  const confirmRemove = () => {
    onRemove(paymentMethod.id);
    setShowRemoveConfirm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCardIcon(paymentMethod.type)}</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {paymentMethod.type || 'Card'} {paymentMethod.last4 ? `ending in ${paymentMethod.last4}` : ''}
            </h4>
            {isDefault && (
              <div className="flex items-center gap-1">
                <MdStar className="text-yellow-500 text-sm" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  Default
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isDefault && (
            <button
              onClick={() => onSetDefault(paymentMethod.id)}
              className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
              title="Set as default"
            >
              <MdStarBorder className="text-lg" />
            </button>
          )}
          
          <button
            onClick={() => onEdit(paymentMethod)}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="Edit"
          >
            <CgPen className="text-lg" />
          </button>
          
          <button
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove"
            disabled={isRemoving}
          >
            <CgTrash className="text-lg" />
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Card Number:</span>
          <span className="font-mono text-gray-900 dark:text-white">
            {maskCardNumber(paymentMethod.last4)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Expires:</span>
          <span className="text-gray-900 dark:text-white">
            {paymentMethod.expMonth}/{paymentMethod.expYear}
          </span>
        </div>
        
        {paymentMethod.brand && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Brand:</span>
            <span className="text-gray-900 dark:text-white capitalize">
              {paymentMethod.brand}
            </span>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <MdWarning className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Remove Payment Method
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to remove this payment method? 
              You'll need to add a new one to continue making payments.
            </p>
            
            <div className="flex gap-3">
              <CommonCustomOutlineButton
                text="Cancel"
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1"
              />
              <CommonButton
                text={isRemoving ? "Removing..." : "Remove"}
                onClick={confirmRemove}
                className="flex-1 bg-red-600 hover:bg-red-700 !text-white"
                disabled={isRemoving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Payment Methods Manager Component
function PaymentMethodsManager() {
  const navigate = useNavigate();
  const {
    paymentMethods,
    loading,
    adding,
    updating,
    removing,
    handleAddPaymentMethod,
    handleUpdatePaymentMethod,
    handleRemovePaymentMethod,
    handleSetDefault,
    isAuthenticated
  } = usePaymentMethods();

  const [currentView, setCurrentView] = useState('list'); // 'list' or 'add'
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);

  const handleAdd = async (paymentData) => {
    try {
      await handleAddPaymentMethod(paymentData);
      setCurrentView('list'); // Go back to list view
      toast.success('Payment method added successfully!');
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleEdit = (paymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
  };

  const handleUpdate = async (paymentData) => {
    try {
      await handleUpdatePaymentMethod(editingPaymentMethod.id, paymentData);
      setEditingPaymentMethod(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleRemove = async (paymentMethodId) => {
    try {
      await handleRemovePaymentMethod(paymentMethodId);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Please login to manage your payment methods.
        </p>
      </div>
    );
  }

  // Show Add New Credit Card view
  if (currentView === 'add') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            ← Back to Payment Methods
          </button>
        </div>
        <AddNewCreditCard 
          onSubmit={handleAdd}
          onCancel={() => setCurrentView('list')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Methods
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your saved payment methods for quick and secure transactions.
          </p>
        </div>
        
        <CommonButton
          text="Add Payment Method"
          icon={<CgAdd />}
          onClick={() => setCurrentView('add')}
          className="px-6 py-3"
        />
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MdSecurity className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">Security & Privacy</p>
            <p className="mt-1">
              Your payment information is encrypted and secure. We never store your full card details on our servers.
              All transactions are processed through industry-standard secure payment gateways.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payment methods...</span>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <CgCreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No payment methods
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get started by adding your first payment method.
          </p>
          <CommonButton
            text="Add Payment Method"
            onClick={() => setCurrentView('add')}
            className="mt-4"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((pm) => (
            <PaymentMethodCard
              key={pm.id}
              paymentMethod={pm}
              onEdit={handleEdit}
              onRemove={handleRemove}
              onSetDefault={handleSetDefault}
              isDefault={pm.isDefault}
              isRemoving={removing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentMethodsManager;
