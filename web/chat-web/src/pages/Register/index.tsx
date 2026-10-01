import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import AuthForm from '@/components/AuthForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register, type RegisterRequest } from '@/apis';
import { ApiError } from '@/utils/http';
import { paths } from '@/router/paths';
import { useAuth } from '@/stores/auth.tsx';

const INITIAL_FORM: RegisterRequest = {
  username: '',
  password: '',
  confirm_new_password: '',
  phone: '',
  email: '',
  nickname: '',
};

/** 输入框下方的小红字 */
function FieldError({ message }: { message?: string }) {
  return (
    <p className="min-h-5 text-xs text-destructive" role="alert">
      {message ?? ''}
    </p>
  );
}

export default function RegisterPage() {
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegisterRequest>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const set = <K extends keyof RegisterRequest>(
    key: K,
    value: RegisterRequest[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    if (form.password !== form.confirm_new_password) {
      setFieldErrors({ confirm_new_password: '两次输入的密码不一致' });
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterRequest = {
        username: form.username,
        password: form.password,
        confirm_new_password: form.confirm_new_password,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(form.email ? { email: form.email } : {}),
        ...(form.nickname ? { nickname: form.nickname } : {}),
      };

      const res = await register(payload);
      setToken(res.token);
      setUser(res);
      navigate(paths.home, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidationError() && err.errors) {
          const map: Record<string, string> = {};
          for (const fe of err.errors) {
            const key = fe.field.replace(/^body\./, '');
            map[key] = fe.msg.replace(/^Value error,\s*/, '');
          }
          setFieldErrors(map);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('网络异常，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      variant="register"
      eyebrow="创建账户"
      title="注册"
      description="填写基础信息，开始新的对话"
      submitText="注册"
      loadingText="注册中…"
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          已有账号？
          <Link
            to={paths.login}
            className="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            登录
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-5">
        {/* 用户名 */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            autoComplete="username"
            aria-invalid={!!fieldErrors.username}
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
          />
          <FieldError message={fieldErrors.username} />
        </div>

        {/* 密码 + 确认密码 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
            <FieldError message={fieldErrors.password} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm_new_password">确认密码</Label>
            <Input
              id="confirm_new_password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.confirm_new_password}
              value={form.confirm_new_password}
              onChange={(e) => set('confirm_new_password', e.target.value)}
            />
            <FieldError message={fieldErrors.confirm_new_password} />
          </div>
        </div>

        {/* 分隔线 */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background/70 px-2 text-xs text-muted-foreground">
              可选信息
            </span>
          </div>
        </div>

        {/* 昵称 + 手机号 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname">昵称</Label>
            <Input
              id="nickname"
              autoComplete="nickname"
              placeholder="张三"
              aria-invalid={!!fieldErrors.nickname}
              value={form.nickname}
              onChange={(e) => set('nickname', e.target.value)}
            />
            <FieldError message={fieldErrors.nickname} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="11 位手机号"
              aria-invalid={!!fieldErrors.phone}
              value={form.phone}
              onChange={(e) =>
                set('phone', e.target.value.replace(/\D/g, '').slice(0, 11))
              }
            />
            <FieldError message={fieldErrors.phone} />
          </div>
        </div>

        {/* 邮箱 */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!fieldErrors.email}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        {/* 通用错误 */}
        {generalError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {generalError}
          </div>
        )}
      </div>
    </AuthForm>
  );
}
