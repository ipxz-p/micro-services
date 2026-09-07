import * as React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Form-level error, e.g. a rejected login. Sits above the fields because it
 * belongs to the whole form rather than to any one input.
 */
export function FormBanner({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  if (!children) return null;
  return (
    <div
      role="alert"
      data-slot="form-banner"
      className={cn(
        'rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-destructive',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
