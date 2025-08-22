import React, { useState } from 'react';
import { CommonButton, CommonInput } from '../index';
import { changePassword } from '../../redux/services/authService';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { getAccountSettingTranslations, getValidationTranslations } from '../../utils/translations';

function ChangePassword() {
  const { language } = useLanguage();
  const t = getAccountSettingTranslations(language);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Real-time validation for confirm password
    if (name === 'confirmPassword') {
      if (!value) {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      } else if (formData.newPassword !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: t.passwordsDoNotMatch }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
    
    // Clear other field errors
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    // Show validation error immediately when user focuses on field
    if (name === 'confirmPassword') {
      if (!formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: t.confirmPasswordRequired }));
      } else if (formData.newPassword !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: t.passwordsDoNotMatch }));
      }
    } else if (name === 'currentPassword') {
      if (!formData.currentPassword) {
        setErrors(prev => ({ ...prev, currentPassword: t.currentPasswordRequired }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate on blur
    if (name === 'confirmPassword') {
      if (value && formData.newPassword !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: t.passwordsDoNotMatch }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = t.currentPasswordRequired;
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = t.newPasswordRequired;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.confirmPasswordRequired;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsDoNotMatch;
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        await changePassword(formData.currentPassword, formData.newPassword);
        toast.success(t.passwordChangedSuccess);
        
        // Clear form after successful change
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // Clear all errors
        setErrors({});
      } catch (error) {
        console.error('Password change error:', error);
        toast.error(error.message || t.failedToChangePassword);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper to render password input
  const renderPasswordInput = ({
    label, id, name, value, onChange, error, placeholder, onFocus, onBlur, showErrorOnFocus, showPasswordToggle = true, showPasswordValidation = false
  }) => (
    <CommonInput
      label={label}
      type="password"
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      showErrorOnFocus={showErrorOnFocus}
      error={error}
      placeholder={placeholder}
      showPasswordToggle={showPasswordToggle}
      showPasswordValidation={showPasswordValidation}
      autoComplete="off"
      labelFontSize="text-14"
    />
  );

  return (
    <div className="dark:bg-customBrown bg-white dark:text-white border border-gray-200 dark:border-customBorderColor p-8 rounded-2xl mx-auto mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <h2 className="text-24 font-ttcommons font-bold mb-8">{t.changePassword}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mt-6">
          {renderPasswordInput({
            label: t.currentPassword,
            id: 'currentPassword',
            name: 'currentPassword',
            value: formData.currentPassword,
            onChange: handleChange,
            onFocus: handleFocus,
            onBlur: handleBlur,
            showErrorOnFocus: true,
            error: errors.currentPassword,
            placeholder: t.enterCurrentPassword,
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            {renderPasswordInput({
              label: t.newPassword,
              id: 'newPassword',
              name: 'newPassword',
              value: formData.newPassword,
              onChange: handleChange,
              onFocus: handleFocus,
              onBlur: handleBlur,
              showErrorOnFocus: true,
              error: errors.newPassword,
              placeholder: t.enterNewPassword,
              showPasswordValidation: true,
            })}
          </div>
          
          {renderPasswordInput({
            label: t.confirmPassword,
            id: 'confirmPassword',
            name: 'confirmPassword',
            value: formData.confirmPassword,
            onChange: handleChange,
            onFocus: handleFocus,
            onBlur: handleBlur,
            showErrorOnFocus: true,
            error: errors.confirmPassword,
            placeholder: t.enterConfirmPassword,
          })}
        </div>
        <div className="mt-8">
          <CommonButton
            text={isLoading ? t.changingPassword : t.saveChanges}
            className=" !text-white rounded-lg px-8 py-2"
            type="submit"
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;
