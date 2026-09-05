import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely.
 *
 * clsx resolves conditionals ({ 'x': cond }, arrays, falsy values) into a
 * string; twMerge then drops earlier classes that a later one overrides, so
 * `cn('p-2', 'p-4')` yields `p-4` instead of both. That is what makes a
 * `className` prop able to override a component's own defaults.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
