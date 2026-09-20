import React from 'react';

export default function BigButton({
  children, icon, onClick, variant = 'primary', className = '', disabled = false, type = 'button', ...rest
}) {
  const cls = {
    primary: 'btn-gold',
    accent: 'btn-gold',
    outline: 'btn-glass',
    danger: 'btn-glass border-red-500/20 text-red-400 hover:border-red-500/40 hover:bg-red-500/5',
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${cls[variant]} ${className}`} {...rest}>
      {icon && <span className="text-base" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}


