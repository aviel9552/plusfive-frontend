import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '../../context/ThemeContext';

function CommonOutlineButton({ text, onClick, className = '', textClass = '', iconClassName = '', type = 'button', icon, lightBgColor = '#ffffff', darkBgColor = '#121212', bgColor, disabled = false }) {
  const { isDarkMode } = useTheme(); // ✅ dark mode from context

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        px-8 py-2
        dark:text-white text-black font-ttcommons font-medium
        transition-all duration-300 ease-in-out
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'}
        border-2 border-transparent
        ${className}
      `}
      style={{
        '--bg-color': bgColor || (isDarkMode ? darkBgColor : lightBgColor),
        backgroundImage: bgColor === 'transparent' ? 
          'linear-gradient(to right, #DF64CC, #FF2380, #FE5D39)' :
          `linear-gradient(var(--bg-color), var(--bg-color)),
          linear-gradient(to right, #DF64CC, #FF2380, #FE5D39)`,
        backgroundOrigin: 'border-box',
        backgroundClip: bgColor === 'transparent' ? 'border-box' : 'padding-box, border-box',
      }}
    >
      <div className={`flex items-center justify-center gap-2 ${textClass}`}>
        {icon && <span className={iconClassName}>{icon}</span>}
        {text}
      </div>
    </button>
  )
}

CommonOutlineButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  textClass: PropTypes.string,
  iconClassName: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  lightBgColor: PropTypes.string,
  darkBgColor: PropTypes.string,
  bgColor: PropTypes.string,
  disabled: PropTypes.bool,
}

export default CommonOutlineButton
