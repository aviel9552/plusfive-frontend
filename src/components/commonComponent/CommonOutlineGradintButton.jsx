import React from 'react'
import PropTypes from 'prop-types'

function CommonOutlineGradientButton({
  text,
  onClick,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center
        px-8 py-2
        text-white text-xl font-ttcommons font-medium
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[1.02]
        active:scale-[0.98]
        border-2 rounded-full
        bg-transparent
        ${className}
      `}
      style={{
        '--border-radius': '12px',
        '--border-width': '1.5px',
        appearance: 'none',
        position: 'relative',
        padding: '12px 72px',
        border: '0',
        fontFamily: '"Roboto", Arial, "Segoe UI", sans-serif',
        fontSize: '18px',
        fontWeight: '500',
        color: '#fff',
        zIndex: '2',
        boxSizing: 'border-box'
      }}
    >
      <div className={`flex items-center justify-center ${icon ? 'gap-2' : 'gap-0'}`}>
        {iconPosition === 'left' && icon}
        {text}
        {iconPosition === 'right' && icon}
      </div>
      <style jsx>{`
        button::after {
          --m-i: linear-gradient(#000, #000);
          --m-o: content-box, padding-box;
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          padding: var(--border-width);
          border-radius: var(--border-radius);
          background-image: linear-gradient(259deg, #ff257c 3.28%, #ff257c 49.86%, #ff257c 100.32%);
          -webkit-mask-image: var(--m-i), var(--m-i);
          mask-image: var(--m-i), var(--m-i);
          -webkit-mask-origin: var(--m-o);
          mask-origin: var(--m-o);
          -webkit-mask-clip: var(--m-o);
          mask-composite: exclude;
          -webkit-mask-composite: destination-out;
          filter: hue-rotate(0);
          z-index: -1;
        }
        
        button,
        button::after {
          box-sizing: border-box;
        }
      `}</style>
    </button>
  )
}

CommonOutlineGradientButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right'])
}

export default CommonOutlineGradientButton
