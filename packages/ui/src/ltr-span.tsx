import { cn } from '@entelewallet/utils';
import type { HTMLAttributes } from 'react';

export function LtrSpan({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span dir="ltr" className={cn('font-mono inline-block', className)} {...props}>
      {children}
    </span>
  );
}
