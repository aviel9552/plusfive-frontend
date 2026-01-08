import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { CommonButton, CommonInput } from '../index';
import { changePassword } from '../../redux/services/authService';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { getAccountSettingTranslations, getValidationTranslations } from '../../utils/translations';
import { BRAND_COLOR } from '../../utils/calendar/constants';

function ChangePassword({ isEmbedded = false, onLoadingChange }) {
  const { language } = useLanguage();
  const t = getAccountSettingTranslations(language);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    if (!password) {
      return t.newPasswordRequired;
    }
    if (password.length < 8) {
      return " ";
      // return v.passwordMinLength;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return " ";
      // return v.passwordLowercase;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return " ";
      // return v.passwordUppercase;
    }
    if (!/(?=.*\d)/.test(password)) {
      return " ";
      // return v.passwordNumber;
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return " ";
      // return v.passwordSpecialChar;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Real-time validation for new password
    if (name === 'newPassword') {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, newPassword: passwordError }));
      
      // Also validate confirm password if it exists
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: t.passwordsDoNotMatch }));
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
      }
    }

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
    } else if (name === 'newPassword') {
      if (!formData.newPassword) {
        setErrors(prev => ({ ...prev, newPassword: t.newPasswordRequired }));
      } else {
        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
          setErrors(prev => ({ ...prev, newPassword: passwordError }));
        }
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate on blur
    if (name === 'newPassword') {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, newPassword: passwordError }));
    } else if (name === 'confirmPassword') {
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
    
    // New Password validation
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
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
      if (onLoadingChange) onLoadingChange(true);
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
        if (onLoadingChange) onLoadingChange(false);
      }
    }
  };

  // Helper to render password input
  const renderPasswordInput = ({
    label, id, name, value, onChange, error, placeholder, onFocus, onBlur, showErrorOnFocus, showPasswordToggle = true, showPasswordValidation = false, required = true
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
      required={required}
    />
  );

  return (
    <div>
      {!isEmbedded && (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
              {t.changePassword}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              עדכן את הסיסמה שלך כדי לשמור על אבטחת החשבון שלך.{" "}
              <a href="#" className="text-[#ff257c] hover:underline">למד עוד</a>
            </p>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
              שינוי סיסמה
            </h3>
          </div>
        </>
      )}
      <form id="change-password-form" onSubmit={handleSubmit}>
        {isEmbedded ? (
          <div className="space-y-4 mt-6">
            {/* סיסמה נוכחית */}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                <FiLock className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">סיסמה נוכחית</div>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={t.enterCurrentPassword}
                    className={`w-full pr-10 pl-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border ${
                      errors.currentPassword 
                        ? 'border-red-500' 
                        : 'border-gray-200 dark:border-commonBorder'
                    } rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors`}
                    dir="rtl"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1 mr-1">{errors.currentPassword}</p>
                )}
              </div>
            </div>

            {/* סיסמה חדשה */}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                <FiLock className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">סיסמה חדשה</div>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={t.enterNewPassword}
                    className={`w-full pr-10 pl-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border ${
                      errors.newPassword 
                        ? 'border-red-500' 
                        : 'border-gray-200 dark:border-commonBorder'
                    } rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors`}
                    dir="rtl"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1 mr-1">{errors.newPassword}</p>
                )}
              </div>
            </div>

            {/* אימות סיסמה */}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                <FiLock className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">אימות סיסמה</div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={t.enterConfirmPassword}
                    className={`w-full pr-10 pl-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border ${
                      errors.confirmPassword 
                        ? 'border-red-500' 
                        : 'border-gray-200 dark:border-commonBorder'
                    } rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors`}
                    dir="rtl"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 mr-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

          </div>
        ) : (
          <>
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
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t.changingPassword : t.saveChanges}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default ChangePassword;
