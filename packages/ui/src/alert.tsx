import { cn } from '@entelewallet/utils';
import type { HTMLAttributes } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'error';
}

const variants = {
  info: 'border-cyan-200 bg-cyan-50 text-cyan-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

export function Alert({ className, variant = 'info', children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-lg border px-4 py-3 text-sm', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
