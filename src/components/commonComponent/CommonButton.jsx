import React from 'react'
import PropTypes from 'prop-types'

function CommonButton({ text, onClick, className = '', type = 'button', icon, iconPosition = 'left', gap = 'gap-2' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-gradient-to-r from-[#DF64CC] via-[#FF2380] to-[#FE5D39]
        text-white font-ttcommons font-medium
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[1.02]
        active:scale-[0.98]
        ${className}
      `}
    >
      <div className={`flex items-center justify-center ${icon ? gap : 'gap-0'}`}>
        {iconPosition === 'left' && icon}
        <p className='mt-[3px]'>
          {text}
        </p>
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
  gap: PropTypes.string
}

export default CommonButton
