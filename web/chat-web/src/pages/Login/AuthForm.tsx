import React from 'react';
import { Button } from '@/components/ui/button';
import ParticleBackground from '@/components/particle-background';

interface AuthFormProps {
  title: string;
  description: string;
  submitText: string;
  loadingText: string;
  loading: boolean;
  onSubmit: (e: React.SyntheticEvent) => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** 顶部图标 */
  icon: React.ReactNode;
  /** 顶部英文小标 */
  badge: string;
}

export default function AuthForm({
  title,
  description,
  submitText,
  loadingText,
  loading,
  onSubmit,
  children,
  footer,
  icon,
  badge,
}: AuthFormProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ParticleBackground />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md space-y-6 overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-6 shadow-lg backdrop-blur-md sm:p-8"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/25 to-transparent" />

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-full border border-border/60 bg-background/50">
            {icon}
          </div>
          <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-muted-foreground/70 uppercase">
            {badge}
          </span>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {children}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? loadingText : submitText}
        </Button>

        {footer}
      </form>
    </div>
  );
}
