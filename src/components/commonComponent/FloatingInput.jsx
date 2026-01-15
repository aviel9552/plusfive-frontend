import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { useLanguage } from '../../context/LanguageContext';

function FloatingInput({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  error,
  placeholder,
  onFocus,
  onBlur,
  showPasswordToggle = false,
  required = false,
  suggestions = [],
  onSuggestionSelect,
  autoComplete = 'off',
}) {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const hasValue = value && value.toString().trim() !== '';
  const shouldFloat = isFocused || hasValue;

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
    if (onBlur) onBlur(e);
  };

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else if (onChange) {
      const syntheticEvent = {
        target: {
          name,
          value: suggestion.password || suggestion.email || suggestion,
        },
      };
      onChange(syntheticEvent);
    }
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  return (
    <div className="relative w-full">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px transparent inset !important;
          -webkit-text-fill-color: #000000 !important;
          box-shadow: 0 0 0 30px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      <div className="relative" style={{ minHeight: '56px' }}>
        <input
          ref={inputRef}
          type={inputType}
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={shouldFloat ? placeholder : ''}
          className={`
            w-full bg-transparent border-0 border-b 
            ${error 
              ? 'border-red-500' 
              : ''
            }
            pt-6 pb-2 px-0
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none
            transition-colors duration-200
            font-light
            ${isRTL ? 'text-right' : 'text-left'}
          `}
          style={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            color: error ? undefined : '#000000',
            borderColor: error ? undefined : '#000000',
            outline: 'none',
            boxShadow: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}
          autoComplete={autoComplete}
        />
        
        <label
          htmlFor={id}
          className={`
            absolute ${isRTL ? 'right-0' : 'left-0'} 
            ${shouldFloat 
              ? 'top-0 text-xs' 
              : 'top-6 text-base'
            }
            pointer-events-none
            transition-all duration-300 ease-out
          `}
          style={{ color: '#000000' }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Password Toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className={`absolute ${isRTL ? 'left-0' : 'right-0'} bottom-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 z-10`}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <BsEyeSlash className="h-5 w-5" /> : <BsEye className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
            >
              {suggestion.avatar && (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">
                    {suggestion.avatar}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {suggestion.name || suggestion.email || suggestion}
                </div>
                {suggestion.email && suggestion.name && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {suggestion.email}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

FloatingInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  showPasswordToggle: PropTypes.bool,
  required: PropTypes.bool,
  suggestions: PropTypes.array,
  onSuggestionSelect: PropTypes.func,
  autoComplete: PropTypes.string,
};

export default FloatingInput;
