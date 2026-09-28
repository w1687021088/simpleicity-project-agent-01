import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { UserPlus } from 'lucide-react';
import AuthForm from '@/pages/Login/AuthForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register, type RegisterRequest } from '@/apis/auth';
import { ApiError } from '@/utils/http';
import { paths } from '@/router/paths';

const INITIAL_FORM: RegisterRequest = {
  username: '',
  password: '',
  confirm_password: '',
  phone: '',
  email: '',
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegisterRequest>(INITIAL_FORM);
  /** 字段级错误：{ password: '密码强度不够', ... } */
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  /** 通用错误（非字段级的） */
  const [generalError, setGeneralError] = useState<string | null>(null);

  const set = <K extends keyof RegisterRequest>(
    key: K,
    value: RegisterRequest[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // 用户一改动，就清掉该字段的错误
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

    // 前端基本校验
    if (form.password !== form.confirm_password) {
      setFieldErrors({ confirm_password: '两次输入的密码不一致' });
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterRequest = {
        username: form.username,
        password: form.password,
        confirm_password: form.confirm_password,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(form.email ? { email: form.email } : {}),
      };

      await register(payload);
      navigate(paths.login, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidationError() && err.errors) {
          // 把后端的 body.xxx 映射到本地字段名
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
      icon={<UserPlus className="size-5" />}
      badge="Sign Up"
      title="注册"
      description="创建一个新账号"
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
      <div className="space-y-4">
        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="confirm_password">确认密码</Label>
          <Input
            id="confirm_password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.confirm_password}
            value={form.confirm_password}
            onChange={(e) => set('confirm_password', e.target.value)}
          />
          <FieldError message={fieldErrors.confirm_password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            手机号
            <span className="ml-1 text-xs text-muted-foreground">（可选）</span>
          </Label>
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

        <div className="space-y-2">
          <Label htmlFor="email">
            邮箱
            <span className="ml-1 text-xs text-muted-foreground">（可选）</span>
          </Label>
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
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {generalError}
          </div>
        )}
      </div>
    </AuthForm>
  );
}
