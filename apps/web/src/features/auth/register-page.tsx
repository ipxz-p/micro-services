import { AuthForm } from './auth-form';

export function RegisterPage() {
  return (
    <AuthForm
      title="Register"
      submitLabel="Create account"
      loadingLabel="Creating account"
      passwordHint="Minimum 8 characters."
      switchPrompt="Already have one?"
      switchAction="Sign in"
      switchTo="/login"
    />
  );
}
