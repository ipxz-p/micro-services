import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/shared/ui/card';
import { FieldError } from '@/shared/ui/field-error';
import { FormBanner } from '@/shared/ui/form-banner';
import { useAuthForm } from './use-auth-form';

type AuthFormProps = {
  title: string;
  submitLabel: string;
  loadingLabel: string;
  passwordHint?: string;
  switchPrompt: string;
  switchAction: string;
  switchTo: string;
};

export function AuthForm({
  title,
  submitLabel,
  loadingLabel,
  passwordHint,
  switchPrompt,
  switchAction,
  switchTo,
}: AuthFormProps) {
  const { form, submit, formError, isSubmitting } = useAuthForm();
  const { errors } = form.formState;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Card className="w-full max-w-[456px] gap-8 rounded-xl border-0 p-6 sm:border sm:p-10">
        <CardHeader className="gap-3 px-0">
        <h1 className="text-4xl font-extrabold uppercase leading-[0.98] tracking-[-0.04em] sm:text-[46px]">
          {title}
        </h1>
      </CardHeader>

      <CardContent className="px-0">
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <FormBanner>{formError}</FormBanner>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-[11px] font-semibold uppercase tracking-[0.09em] text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                aria-invalid={errors.email ? true : undefined}
                className="h-12 rounded-md text-base md:text-sm"
                {...form.register('email')}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-[0.09em] text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                aria-invalid={errors.password ? true : undefined}
                className="h-12 rounded-md text-base md:text-sm"
                {...form.register('password')}
              />
              {passwordHint && !errors.password && (
                <p className="text-xs text-muted-foreground">{passwordHint}</p>
              )}
              <FieldError>{errors.password?.message}</FieldError>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <Button
              type="submit"
              size="xl"
              loading={isSubmitting}
              loadingText={loadingLabel}
              shape="pill"
              className="w-full"
            >
              {submitLabel}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {switchPrompt}{' '}
              <Link
                to={switchTo}
                className="font-semibold text-brand-link underline-offset-4 hover:underline"
              >
                {switchAction}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
      </Card>
    </div>
  );
}
