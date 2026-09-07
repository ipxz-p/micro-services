import * as React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Validation message for a single field.
 *
 * role="alert" makes screen readers announce it the moment it appears, which is
 * the whole point: a sighted user sees red text under the input, everyone else
 * needs to be told.
 */
export function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  if (!children) return null;
  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn('text-sm text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  );
}
