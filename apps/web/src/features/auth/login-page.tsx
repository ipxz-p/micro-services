import { AuthForm } from './auth-form';

export function LoginPage() {
  return (
    <AuthForm
      title="Sign in"
      submitLabel="Sign in"
      loadingLabel="Signing in"
      switchPrompt="No account?"
      switchAction="Create one"
      switchTo="/register"
    />
  );
}
