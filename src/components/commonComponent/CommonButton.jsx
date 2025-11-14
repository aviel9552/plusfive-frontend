import React from 'react'
import PropTypes from 'prop-types'

function CommonButton({ text, onClick, className = '', type = 'button', icon, iconPosition = 'left', gap = 'gap-2', disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        ${disabled 
          ? 'bg-gray-400 cursor-not-allowed opacity-60' 
          : 'bg-gradient-to-r from-[#ff257c] via-[#ff7cb1] to-[#ffb7d4] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
        }
        text-white font-ttcommons font-medium
        transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      <div className={`flex items-center justify-center ${icon ? gap : 'gap-0'}`}>
        {iconPosition === 'left' && icon}
          {text}
        {iconPosition === 'right' && icon}
      </div>
    </button>
  )
}

CommonButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  gap: PropTypes.string,
  disabled: PropTypes.bool
}

export default CommonButton
