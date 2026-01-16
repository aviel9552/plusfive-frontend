import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CommonInput, CommonButton } from '../../index';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createCategory, updateCategory } from '../../../redux/actions/categoryActions';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminCategoryTranslations } from '../../../utils/translations';

function CreateAndEditCategory({ isOpen, onClose, categoryId, categoryData, onSuccess }) {
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const t = getAdminCategoryTranslations(language);
  const isEditMode = !!categoryId;

  const [formData, setFormData] = useState({
    title: '',
    status: 'active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});


  // Initialize form data when modal opens or categoryData changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && categoryData) {
        // Edit mode: populate form with category data
        setFormData({
          title: categoryData.title || '',
          status: categoryData.status || 'active',
        });
      } else {
        // Create mode: reset form
        setFormData({ title: '', status: 'active' });
      }
      setErrors({});
    } else {
      // Reset form when modal closes
      setFormData({ title: '', status: 'active' });
      setErrors({});
    }
  }, [isOpen, isEditMode, categoryData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = t.categoryTitleRequired;
    } else if (formData.title.trim().length < 2) {
      newErrors.title = t.titleMustBeAtLeast2Characters;
    } else if (formData.title.trim().length > 100) {
      newErrors.title = t.titleMustBeLessThan100Characters;
    }

    if (!formData.status) {
      newErrors.status = t.statusRequired;
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

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      status: value,
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
      let result;
      if (isEditMode) {
        result = await dispatch(updateCategory(categoryId, {
          title: formData.title.trim(),
          status: formData.status
        }));
      } else {
        result = await dispatch(createCategory({
          title: formData.title.trim(),
          status: formData.status
        }));
      }

      if (result.success) {
        toast.success(isEditMode ? t.categoryUpdatedSuccessfully : t.categoryCreatedSuccessfully);
        setFormData({ title: '', status: 'active' });
        setErrors({});
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(result.error || (isEditMode ? t.failedToUpdateCategory : t.failedToCreateCategory));
      }
    } catch (error) {
      toast.error(error.message || (isEditMode ? t.failedToUpdateCategory : t.failedToCreateCategory));
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
      <div className="relative bg-white dark:bg-customBrown rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[10000] border border-gray-200 dark:border-customBorderColor">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t.editCategory : t.createNewCategory}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <CommonInput
                  label={t.categoryTitle}
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t.enterCategoryTitle}
                  error={errors.title}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.status} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={handleStatusChange}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.active}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={handleStatusChange}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.inactive}</span>
                  </label>
                </div>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <CommonButton
                  type="submit"
                  text={isLoading ? (isEditMode ? t.updating : t.creating) : (isEditMode ? t.updateCategory : t.createCategory)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <CommonButton
                  type="button"
                  text={t.cancel}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={onClose}
                  disabled={isLoading}
                />
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAndEditCategory;
