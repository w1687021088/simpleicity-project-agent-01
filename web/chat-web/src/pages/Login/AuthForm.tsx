import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ParticleBackground from '@/components/particle-background';

export interface AuthFormValues {
  username: string;
  password: string;
}

interface AuthFormProps {
  title: string;
  description: string;
  submitText: string;
  loadingText: string;
  passwordAutoComplete: 'current-password' | 'new-password';
  onSubmit: (values: AuthFormValues) => Promise<void>;
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
  passwordAutoComplete,
  onSubmit,
  footer,
  icon,
  badge,
}: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AuthFormValues>({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ParticleBackground />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm space-y-6 overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-8 shadow-lg backdrop-blur-md"
      >
        {/* 顶部渐变线 */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />

        <div className="flex flex-col items-center gap-3 text-center">
          {/* 图标 */}
          <div className="flex size-11 items-center justify-center rounded-full border border-border/60 bg-background/50">
            {icon}
          </div>

          {/* 英文小标 */}
          <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-muted-foreground/70 uppercase">
            {badge}
          </span>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete={passwordAutoComplete}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? loadingText : submitText}
        </Button>

        {footer}
      </form>
    </div>
  );
}
