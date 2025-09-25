import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiGlobe } from 'react-icons/fi';
import { IoChevronDownOutline } from 'react-icons/io5';
import { useLanguage } from '../../context/LanguageContext';

function CommonNormalDropDown({
  options = [],
  value,
  onChange,
  className = "",
  placeholder = "Select option",
  bgColor = "bg-customBody dark:bg-customBrown",
  textColor = "text-gray-900 dark:text-white",
  fontSize = "text-base",
  showIcon = false,
  borderRadius = "rounded-lg",
  width = "w-full",
  inputWidth = "w-full",
  inputBorderRadius = "rounded-lg",
  anchor = "left",
  label = "",
  required = false,
  padding = "",
}) {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({});
  
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
  
  const selectedOption = options.find(opt => opt.value === safeValue);
  const dropdownRef = useRef(null);
  
  // Calculate dropdown position for responsive behavior
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate available space
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.left;
      const spaceLeft = rect.left;
      
      // Determine if dropdown should open upward
      const shouldOpenUpward = spaceBelow < 200 && spaceAbove > spaceBelow;
      
      // Determine horizontal alignment
      const shouldAlignRight = spaceRight < 200 && spaceLeft > spaceRight;
      
      setDropdownPosition({
        top: shouldOpenUpward ? 'auto' : '100%',
        bottom: shouldOpenUpward ? '100%' : 'auto',
        left: shouldAlignRight ? 'auto' : '0',
        right: shouldAlignRight ? '0' : 'auto',
        maxHeight: shouldOpenUpward ? `${Math.min(spaceAbove - 10, 200)}px` : `${Math.min(spaceBelow - 10, 200)}px`,
        width: '100%',
        minWidth: '200px',
        maxWidth: `${Math.min(viewportWidth - 20, 300)}px`
      });
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block ${fontSize} font-medium mb-2 ${textColor}`}>
          {label}
          {required && <span className={`text-red-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${className}
          ${padding}
          flex items-center justify-between w-full border px-2 p-[0.6rem]
          ${bgColor}
          ${textColor}
          border-gray-200 dark:border-customBorderColor
          hover:border-pink-500 dark:hover:border-pink-500
          focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500
          transition-all duration-200
          font-medium
          ${fontSize}
          ${inputWidth}
          ${inputBorderRadius}
        `}
      >
        {/* <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}> */}
        <div className={`flex items-center gap-2 ${isRTL ? '' : ''}`}>
          {showIcon && (
            <FiGlobe className={`${fontSize} text-gray-500 dark:text-white text-20`} />
          )}
          <span className={`${fontSize} ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''}`}>
            {selectedOption?.shortLabel || selectedOption?.label || placeholder}
          </span>
        </div>
        <IoChevronDownOutline className={`${isRTL ? 'mr-2' : 'ml-2'} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          className={`
            absolute mt-1
            bg-white dark:bg-customBlack
            border border-gray-200 dark:border-customBorderColor
            shadow-xl z-[9999] py-1
            rounded-lg
            backdrop-blur-sm
            overflow-y-auto
          `}
          style={dropdownPosition}
        >
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2.5
                hover:bg-gray-50 dark:hover:bg-[#2C2C2C]
                transition-colors duration-200
                ${fontSize}
                ${value === option.value ? 'text-pink-500 font-semibold bg-pink-50 dark:bg-pink-500/10' : 'text-black dark:text-white'}
              `}
            >
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {showIcon && (
                  <FiGlobe className={`${fontSize} text-gray-500 dark:text-white`} />
                )}
                <span>{option.fullName || option.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

CommonNormalDropDown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      code: PropTypes.string, // for language code like 'en', 'hi'
      shortLabel: PropTypes.string, // for short display like 'En', 'He'
      fullName: PropTypes.string, // for full display like 'English', 'Hebrew'
    })
  ),
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
  fontSize: PropTypes.string,
  showIcon: PropTypes.bool,
  borderRadius: PropTypes.string,
  width: PropTypes.string,
  anchor: PropTypes.oneOf(['left', 'right']),
  label: PropTypes.string,
  required: PropTypes.bool,
  padding: PropTypes.string,
};

export default CommonNormalDropDown;
