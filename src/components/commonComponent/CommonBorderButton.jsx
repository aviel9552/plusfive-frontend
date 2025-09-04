import React from 'react'
import PropTypes from 'prop-types'

function CommonBorderButton({ text, onClick, className = '', type = 'button', icon, iconPosition = 'left' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        // border: '2px solid transparent',
        borderRadius: '8px',
        background: 'linear-gradient(259deg, #FE5D39 3.28%, #FF2380 49.86%, #DF64CC 100.32%)',
        backgroundClip: 'padding-box',
        position: 'relative',
        boxShadow: '0px 0px 0px 1px var(--Colors-Effects-Shadows-shadow-skeumorphic-inner-border, rgba(10, 13, 18, 0.18)) inset, 0px -2px 0px 0px var(--Colors-Effects-Shadows-shadow-skeumorphic-inner, rgba(10, 13, 18, 0.05)) inset, 0px 1px 2px 0px var(--Colors-Effects-Shadows-shadow-xs, rgba(10, 13, 18, 0.05))'
      }}
      className={`
        relative overflow-hidden
        text-white font-ttcommons font-medium
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[0.98]
        active:scale-[0.98]
        before:absolute before:inset-0 before:rounded-md before:p-[2px] before:bg-gradient-to-b before:from-[rgba(255,255,255,0.12)] before:to-[rgba(255,255,255,0.00)] before:pointer-events-none before:z-[-1]
        ${className}
      `}
    >
      <div className="flex items-center justify-center gap-[6px]">
        {iconPosition === 'left' && icon}
        {text}
        {iconPosition === 'right' && icon}
      </div>
    </button>
  )
}

CommonBorderButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right'])
}

export default CommonBorderButton
