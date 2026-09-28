import { Link, useNavigate, useLocation } from 'react-router';
import { LogIn } from 'lucide-react';
import AuthForm, { type AuthFormValues } from './AuthForm';
import { login } from '@/apis/auth';
import { useAuth } from '@/stores/auth';
import { paths } from '@/router/paths';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    paths.home;

  const handleSubmit = async (values: AuthFormValues) => {
    const res = await login(values);
    setToken(res.access_token);
    navigate(from, { replace: true });
  };

  return (
    <AuthForm
      icon={<LogIn className="size-5" />}
      badge="Sign In"
      title="登录"
      description="输入账号密码继续"
      submitText="登录"
      loadingText="登录中…"
      passwordAutoComplete="current-password"
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
    />
  );
}
