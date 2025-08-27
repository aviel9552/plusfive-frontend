import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  getPaymentMethods, 
  addPaymentMethod, 
  updatePaymentMethod, 
  removePaymentMethod 
} from '../services/paymentMethodService';
import { toast } from 'react-toastify';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = !!user;

  // Fetch all payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await getPaymentMethods();
      setPaymentMethods(response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add new payment method
  const handleAddPaymentMethod = useCallback(async (paymentData) => {
    if (!isAuthenticated) {
      toast.error('Please login to add payment methods');
      return;
    }

    try {
      setAdding(true);
      const response = await addPaymentMethod(paymentData);
      
      // Add the new payment method to the list
      setPaymentMethods(prev => [...prev, response.data || response]);
      
      toast.success('Payment method added successfully!');
      return response;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error(error.message);
      throw error;
    } finally {
      setAdding(false);
    }
  }, [isAuthenticated]);

  // Update existing payment method
  const handleUpdatePaymentMethod = useCallback(async (paymentMethodId, updateData) => {
    if (!isAuthenticated) {
      toast.error('Please login to update payment methods');
      return;
    }

    try {
      setUpdating(true);
      const response = await updatePaymentMethod(paymentMethodId, updateData);
      
      // Update the payment method in the list
      setPaymentMethods(prev => 
        prev.map(pm => 
          pm.id === paymentMethodId 
            ? { ...pm, ...response.data || response }
            : pm
        )
      );
      
      toast.success('Payment method updated successfully!');
      return response;
    } catch (error) {
      console.error('Failed to update payment method:', error);
      toast.error(error.message);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [isAuthenticated]);

  // Remove payment method
  const handleRemovePaymentMethod = useCallback(async (paymentMethodId) => {
    if (!isAuthenticated) {
      toast.error('Please login to remove payment methods');
      return;
    }

    try {
      setRemoving(true);
      await removePaymentMethod(paymentMethodId);
      
      // Remove the payment method from the list
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      
      toast.success('Payment method removed successfully!');
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      toast.error(error.message);
      throw error;
    } finally {
      setRemoving(false);
    }
  }, [isAuthenticated]);

  // Set default payment method
  const handleSetDefault = useCallback(async (paymentMethodId) => {
    try {
      await handleUpdatePaymentMethod(paymentMethodId, { isDefault: true });
      
      // Update all payment methods to set the new default
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId
        }))
      );
    } catch (error) {
      console.error('Failed to set default payment method:', error);
    }
  }, [handleUpdatePaymentMethod]);

  // Load payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    adding,
    updating,
    removing,
    fetchPaymentMethods,
    handleAddPaymentMethod,
    handleUpdatePaymentMethod,
    handleRemovePaymentMethod,
    handleSetDefault,
    isAuthenticated
  };
};
