import React from 'react';

/**
 * CommonGradientText
 * Props:
 * - children: text ya element
 * - gradient: CSS gradient string (default user ke hisaab se)
 * - style: extra style (object)
 * - className: extra className (yahi se font-size, font-weight, etc. control karo)
 */
function CommonGradientText({
  children,
//   gradient = 'linear-gradient(200deg, #DF64CC 24.76%, #FF2380 38.87%, #FE5D39 51.9%)',
  gradient = ' linear-gradient(259deg, #FE5D39 3.28%, #FF2380 49.86%, #DF64CC 100.32%)',
  style = {},
  className = '',
  ...rest
}) {
  return (
    <span
      className={className}
      style={{
        background: gradient,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

export default CommonGradientText;
