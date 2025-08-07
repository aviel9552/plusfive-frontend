import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { IoChevronDownOutline } from 'react-icons/io5'
import { useTheme } from '../../context/ThemeContext';

function CommonDropDown({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option",
  className = "",
  fontSize = "text-16",
  isDarkMode: propIsDarkMode
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode: contextIsDarkMode } = useTheme();
  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : contextIsDarkMode;

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-auto px-3 py-1 whitespace-nowrap
          flex items-center justify-between
          rounded-full
          ${isDarkMode ? 'text-white' : 'text-black'}
          md:text-xl font-ttcommons font-medium
          transition-all duration-300
          bg-[#121212]
          border-2 border-transparent
          hover:shadow-lg
          ${fontSize}
          ${className}
        `}
        style={{
          '--bg-color': isDarkMode ? '#121212' : '#ffffff',
          backgroundImage: `
            linear-gradient(var(--bg-color), var(--bg-color)),
            linear-gradient(to right, #DF64CC, #FF2380, #FE5D39)
          `,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <span className={fontSize}>{selectedOption?.label || placeholder}</span>
        <IoChevronDownOutline 
          className={`
            ml-2 md:text-sm transition-transform duration-300
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {isOpen && (
        <div 
          className="
            absolute top-full left-0 right-0 mt-2
            bg-[#232323] rounded-xl
            border border-customBorderColor
            shadow-xl z-50
            max-h-60 overflow-y-auto
            scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
          "
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`
                w-full px-4 py-3 whitespace-nowrap
                flex items-center
                text-left font-ttcommons
                transition-colors duration-200
                ${isDarkMode ? 'text-white' : 'text-black'}
                ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                ${isDarkMode ? 'bg-customBrown' : 'bg-white'}
                ${fontSize}
                ${value === option.value ? 'text-pink-500' : (isDarkMode ? 'text-white' : 'text-black')}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

CommonDropDown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  fontSize: PropTypes.string,
  isDarkMode: PropTypes.bool
}

export default CommonDropDown
