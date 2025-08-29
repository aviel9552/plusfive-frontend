import React, { useState, useEffect } from 'react'
import { BsFillExclamationCircleFill, BsEye, BsEyeSlash } from 'react-icons/bs'
import PropTypes from 'prop-types';
import { useLanguage } from '../../context/LanguageContext';
import { getValidationTranslations } from '../../utils/translations';

function CommonInput({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  error,
  placeholder,
  as = 'input',
  rows,
  textColor,
  labelColor,
  inputBg,
  labelFontSize = 'text-xl', // NEW PROP with default
  onFocus,
  onBlur,
  showErrorOnFocus = false, // NEW PROP for real-time validation
  showPasswordToggle = false, // NEW PROP for password toggle
  showPasswordValidation = false, // NEW PROP for password validation
}) {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const v = getValidationTranslations(language); // Use centralized validation translations
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    hasMinLength: false
  });
  
  // Safe value handling
  const safeValue = (() => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      // If it's an object, try to get a meaningful string representation
      if (value.name) return value.name;
      if (value.label) return value.label;
      if (value.value) return value.value;
      return '';
    }
    return String(value);
  })();
  
  const colorClass = textColor ? textColor : 'text-gray-900 dark:text-white';
  const labelClass = labelColor ? labelColor : 'dark:text-white text-black';

  // 👇 labelFontSize yahan use karein
  const labelClasses = `block ${labelFontSize} mb-2 ${labelClass}`;

  const bgClass = inputBg
    ? inputBg
    : error
      ? 'bg-red-100 dark:bg-customRed/10'
      : 'bg-customBody dark:bg-customBrown';

  // Determine input type for password toggle
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const commonClasses = `w-full border rounded-lg px-4 py-3 ${colorClass} ${bgClass} focus:outline-none focus:ring-2 focus:ring-pink-500 ${
    error
      ? `border-customRed ${isRTL ? 'pl-10' : 'pr-10'}`
      : 'border-gray-200 dark:border-customBorderColor'
  }`;

  // Show error when there's an error
  const shouldShowError = !!error;

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return v.passwordRequired;
    if (password.length < 8) return v.passwordMinLength;
    if (password.length > 50) return v.passwordTooLong;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    if (!hasUpperCase) return v.passwordUppercase;
    if (!hasLowerCase) return v.passwordLowercase;
    if (!hasNumbers) return v.passwordNumber;
    if (!hasSpecialChar) return v.passwordSpecialChar;
    
    return "";
  };

  // Update password requirements when value changes
  useEffect(() => {
    if (showPasswordValidation && type === 'password' && safeValue) {
      const requirements = {
        hasLowerCase: /[a-z]/.test(safeValue),
        hasUpperCase: /[A-Z]/.test(safeValue),
        hasNumbers: /\d/.test(safeValue),
        hasSpecialChar: /[!@#$%^&*]/.test(safeValue),
        hasMinLength: safeValue.length >= 8
      };
      setPasswordRequirements(requirements);
    }
  }, [safeValue, showPasswordValidation, type]);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <div className="relative">
        {as === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            value={safeValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={rows || 5}
            className={commonClasses}
            autoComplete="off"
          />
        ) : (
          <input
            type={inputType}
            id={id}
            name={name}
            value={safeValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={commonClasses}
            autoComplete="off"
          />
        )}
        
        {/* Password Toggle Button */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-400 hover:text-pink-500 focus:outline-none transition-colors duration-200`}
            onClick={handlePasswordToggle}
            tabIndex={-1}
          >
            {showPassword ? <BsEyeSlash className="h-5 w-5" /> : <BsEye className="h-5 w-5" />}
          </button>
        )}
        
        {shouldShowError && !(showPasswordToggle && type === 'password') && (
          <div
            className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex pointer-events-none ${
              as === 'textarea' ? 'items-start pt-4' : 'items-center'
            }`}
          >
            <BsFillExclamationCircleFill className="h-5 w-5 text-customRed" />
          </div>
        )}
      </div>
      {shouldShowError && <p className="text-customRed text-lg mt-1">{error}</p>}
      
      {/* Password Requirements Display */}
      {showPasswordValidation && type === 'password' && safeValue && (
        <div className={`mt-3 p-3 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className={`text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{v.passwordRequirements}</p>
          <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center text-xs ${passwordRequirements.hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <span className={isRTL ? 'ml-2' : 'mr-2'}>{passwordRequirements.hasMinLength ? '✅' : '❌'}</span>
              <span className={isRTL ? 'text-right' : 'text-left'}>{v.atLeast8Characters}</span>
            </div>
            <div className={`flex items-center text-xs ${passwordRequirements.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <span className={isRTL ? 'ml-2' : 'mr-2'}>{passwordRequirements.hasLowerCase ? '✅' : '❌'}</span>
              <span className={isRTL ? 'text-right' : 'text-left'}>{v.lowercaseLetter}</span>
            </div>
            <div className={`flex items-center text-xs ${passwordRequirements.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <span className={isRTL ? 'ml-2' : 'mr-2'}>{passwordRequirements.hasUpperCase ? '✅' : '❌'}</span>
              <span className={isRTL ? 'text-right' : 'text-left'}>{v.uppercaseLetter}</span>
            </div>
            <div className={`flex items-center text-xs ${passwordRequirements.hasNumbers ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <span className={isRTL ? 'ml-2' : 'mr-2'}>{passwordRequirements.hasNumbers ? '✅' : '❌'}</span>
              <span className={isRTL ? 'text-right' : 'text-left'}>{v.number}</span>
            </div>
            <div className={`flex items-center text-xs ${passwordRequirements.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <span className={isRTL ? 'ml-2' : 'mr-2'}>{passwordRequirements.hasSpecialChar ? '✅' : '❌'}</span>
              <span className={isRTL ? 'text-right' : 'text-left'}>{v.specialCharacter}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

CommonInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  as: PropTypes.oneOf(['input', 'textarea']),
  rows: PropTypes.number,
  textColor: PropTypes.string,
  labelColor: PropTypes.string,
  inputBg: PropTypes.string,
  labelFontSize: PropTypes.string, // NEW
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  showErrorOnFocus: PropTypes.bool, // NEW
  showPasswordToggle: PropTypes.bool, // NEW
  showPasswordValidation: PropTypes.bool, // NEW
};

export default CommonInput
