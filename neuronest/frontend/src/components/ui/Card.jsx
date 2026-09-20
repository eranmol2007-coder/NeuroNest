import React from 'react';

export default function Card({ children, className = '', hover = true, ...rest }) {
  return (
    <div
      className={`glass-card p-6 ${hover ? '' : 'hover:transform-none hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.06)] hover:shadow-glass'} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}


