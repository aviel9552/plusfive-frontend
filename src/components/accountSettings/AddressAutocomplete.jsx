import React from 'react';
import { FiMapPin } from 'react-icons/fi';

const AddressAutocomplete = ({ value, onChange, onPlaceSelect, error, placeholder, label, required, name = 'address' }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
          <FiMapPin className="text-gray-400" />
        </div>
        <input
          type="text"
          name={name}
          value={value || ''}
          onChange={(e) => {
            if (onChange) {
              const event = {
                ...e,
                target: {
                  ...e.target,
                  name: name,
                  value: e.target.value
                }
              };
              onChange(event);
            }
          }}
          placeholder={placeholder || 'הזן כתובת...'}
          className={`w-full pr-10 pl-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border ${
            error 
              ? 'border-red-500' 
              : 'border-gray-200 dark:border-commonBorder'
          } rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors`}
          dir="rtl"
          autoComplete="off"
        />
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1 mr-1">{error}</p>
      )}
    </div>
  );
};

export default AddressAutocomplete;

