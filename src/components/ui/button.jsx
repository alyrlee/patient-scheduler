import React from 'react';

const buttonVariants = {
  default: 'bg-sky-600 text-white hover:bg-sky-700',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700',
  outline: 'border border-slate-300 bg-white hover:bg-slate-50',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  ghost: 'hover:bg-slate-100',
  link: 'text-sky-600 underline-offset-4 hover:underline',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  ...props 
}, ref) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white transition-colors 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 
        disabled:pointer-events-none disabled:opacity-50
        touch-manipulation
        ${buttonVariants[variant]} 
        ${buttonSizes[size]} 
        ${className}
      `}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };
