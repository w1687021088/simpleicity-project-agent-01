import React from 'react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthBrand, { type AuthVariant } from './AuthBrand';

interface AuthFormProps {
  variant?: AuthVariant;
  title: string;
  description: string;
  eyebrow?: string;
  submitText: string;
  loadingText: string;
  loading: boolean;
  onSubmit: (e: React.SyntheticEvent) => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthForm({
  variant = 'login',
  title,
  description,
  eyebrow = '账户登录',
  submitText,
  loadingText,
  loading,
  onSubmit,
  children,
  footer,
}: AuthFormProps) {
  const isRegister = variant === 'register';

  const formSection = (
    <section
      className={cn(
        'flex items-center justify-center px-6 py-12 sm:px-12',
        isRegister ? 'order-1 lg:px-20' : 'lg:px-16',
      )}
    >
      <form
        onSubmit={onSubmit}
        className={cn('w-full', isRegister ? 'max-w-2xl' : 'max-w-sm')}
      >
        <div className={cn('mb-8', isRegister && 'mb-10')}>
          <p className="mb-3 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={cn('flex flex-col', isRegister ? 'gap-6' : 'gap-5')}>
          {children}
          <Button
            type="submit"
            className={cn('h-11 w-full', isRegister && 'sm:w-44 sm:self-start')}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner data-icon="inline-start" />
                {loadingText}
              </>
            ) : (
              submitText
            )}
          </Button>
        </div>
        <div className="mt-6">{footer}</div>
      </form>
    </section>
  );

  return (
    <main
      className={cn(
        'min-h-screen p-3 sm:p-6',
        isRegister ? 'bg-muted/50' : 'bg-muted/30',
      )}
    >
      <div
        className={cn(
          'mx-auto grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border bg-background shadow-sm sm:min-h-[calc(100vh-3rem)] lg:grid',
          isRegister
            ? 'max-w-7xl lg:grid-cols-[1.18fr_0.82fr]'
            : 'max-w-6xl lg:grid-cols-[0.9fr_1.1fr]',
        )}
      >
        {isRegister ? (
          <>
            {formSection}
            <AuthBrand variant="register" />
          </>
        ) : (
          <>
            <AuthBrand variant="login" />
            {formSection}
          </>
        )}
      </div>
    </main>
  );
}
