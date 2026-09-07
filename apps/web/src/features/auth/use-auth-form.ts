import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * The backend accepts exactly these two fields on both /login and /register.
 * Message strings live here so the copy stays identical across both screens.
 */
export const credentialsSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Must be at least 8 characters.'),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export function useAuthForm() {
  // Form-level error (a rejected login), as opposed to per-field validation.
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    // Validate on submit first, then live once a field has been touched: nagging
    // someone about an "invalid email" while they are still typing it is hostile.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    // Clear the previous rejection so a stale banner never outlives its attempt.
    setFormError(null);

    // TODO(step 6): POST to /api/auth/{login,register} via the shared http
    // client, store the tokens, and redirect. Deliberately not wired yet - the
    // gateway has no CORS headers, so a real fetch would fail in the browser
    // for a reason that has nothing to do with this form.
    console.log('submit', values);

    // Simulated latency so the loading state is actually visible while the UI
    // is being reviewed. Remove when the real request lands.
    await new Promise((resolve) => setTimeout(resolve, 900));
  });

  return {
    form,
    submit,
    formError,
    setFormError,
    isSubmitting: form.formState.isSubmitting,
  };
}
