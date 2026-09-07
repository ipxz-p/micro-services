import { Link } from 'react-router-dom';
import { buttonVariants } from '@/shared/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Error 404
      </p>
      <h1 className="text-4xl font-extrabold uppercase leading-[0.98] tracking-[-0.04em] sm:text-[46px]">
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground">
        That route does not exist in this website.
      </p>

      <Link
        to="/"
        className={buttonVariants({ size: 'xl', shape: 'pill' })}
      >
        Back to Home Page
      </Link>
    </div>
  );
}
