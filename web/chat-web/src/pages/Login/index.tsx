import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import AuthForm from '@/components/AuthForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/apis';
import { useAuth } from '@/stores/auth';
import { ApiError } from '@/utils/http';
import { paths } from '@/router/paths';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from ?? paths.home;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(form);
      if (!res.token) {
        setError('登录失败，请检查用户名和密码');
        return;
      }
      setToken(res.token);
      setUser(res);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('网络异常，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      variant="login"
      eyebrow="账户登录"
      title="登录"
      description="回到你的会话与联系人"
      submitText="登录"
      loadingText="登录中…"
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          还没有账号？
          <Link
            to={paths.register}
            className="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            注册
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            autoComplete="username"
            value={form.username}
            onChange={(e) => {
              setForm({ ...form, username: e.target.value });
              if (error) setError(null);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (error) setError(null);
            }}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}
      </div>
    </AuthForm>
  );
}
