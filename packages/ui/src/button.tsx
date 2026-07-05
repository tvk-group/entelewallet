import { cn } from '@entelewallet/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-blue-800 via-cyan-600 to-violet-600 text-white shadow-lg shadow-cyan-500/20 hover:from-blue-700 hover:via-cyan-500 hover:to-violet-500 hover:shadow-xl hover:shadow-violet-500/20',
        secondary:
          'border border-white/70 bg-white/80 text-slate-700 shadow-sm backdrop-blur-md hover:border-cyan-200/80 hover:bg-white hover:shadow-md',
        ghost: 'text-slate-600 hover:bg-white/70 hover:text-slate-900',
        danger: 'bg-red-600 text-white shadow-md hover:bg-red-500',
        outline:
          'border border-cyan-300/60 bg-cyan-50/60 text-cyan-900 backdrop-blur-sm hover:border-cyan-400/80 hover:bg-cyan-50',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-lg',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base rounded-2xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
