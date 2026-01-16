import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CommonInput, CommonButton, CommonNormalDropDown } from '../../index';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { updateCategory, fetchCategoryById } from '../../../redux/actions/categoryActions';

function EditCategory({ isOpen, onClose, categoryId, onSuccess }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: '',
    status: 'active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);

  const statusOptions = [
    { value: 'active', label: 'Active', code: 'active' },
    { value: 'inactive', label: 'Inactive', code: 'inactive' }
  ];

  // Fetch category data when modal opens with categoryId
  useEffect(() => {
    if (!isOpen || !categoryId) return;

    let cancelled = false;

    const loadCategory = async () => {
      setIsFetching(true);
      setLoadError(null);

      try {
        const result = await dispatch(fetchCategoryById(categoryId));

        if (cancelled) return;

        if (result?.success && result?.data) {
          setFormData({
            title: result.data.title || '',
            status: result.data.status || 'active',
          });
        } else {
          const msg = result?.error || 'Failed to load category';
          setLoadError(msg);
          toast.error(msg);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError('Failed to load category');
          toast.error('Failed to load category');
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    loadCategory();

    return () => {
      cancelled = true;
    };
  }, [isOpen, categoryId, dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: '', status: 'active' });
      setErrors({});
      setIsFetching(false);
      setLoadError(null);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Category title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleStatusChange = (selectedOption) => {
    setFormData({
      ...formData,
      status: selectedOption.value,
    });

    if (errors.status) {
      setErrors({ ...errors, status: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await dispatch(updateCategory(categoryId, {
        title: formData.title.trim(),
        status: formData.status
      }));

      if (result.success) {
        toast.success('Category updated successfully');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Category</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isFetching ? (
            <div className="text-center py-8">
              <div className="text-gray-600 dark:text-gray-400">Loading category...</div>
            </div>
          ) : loadError ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 mb-4">{loadError}</div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : !categoryId ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 mb-4">Invalid category ID</div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <CommonInput
                  label="Category Title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter category title"
                  error={errors.title}
                  required
                />
              </div>

              <div>
                <CommonNormalDropDown
                  label="Status"
                  options={statusOptions}
                  value={formData.status || 'active'}
                  onChange={handleStatusChange}
                  error={errors.status}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <CommonButton
                  type="submit"
                  text={isLoading ? 'Updating...' : 'Update Category'}
                  className="flex-1"
                  disabled={isLoading}
                />
                <CommonButton
                  type="button"
                  text="Cancel"
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={onClose}
                  disabled={isLoading}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditCategory;
