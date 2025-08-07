import React from 'react'
import PropTypes from 'prop-types'

function CommonCustomOutlineButton({ text, onClick, className = '', type = 'button', icon, borderColor = 'border-red-500', textColor = 'dark:text-white text-black', bgClass = 'bg-transparent' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl
        px-8 py-2
        ${bgClass}
        text-xl font-ttcommons font-medium
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[1.02]
        active:scale-[0.98]
        border-2
        ${borderColor}
        ${textColor}
        ${className}  
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="text-2xl">{icon}</span>}
        {text}
      </div>
    </button>
  )
}

CommonCustomOutlineButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  borderColor: PropTypes.string,
  textColor: PropTypes.string,
  bgClass: PropTypes.string,
}

export default CommonCustomOutlineButton
