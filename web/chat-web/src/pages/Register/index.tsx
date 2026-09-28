import { Link, useNavigate } from 'react-router';
import { UserPlus } from 'lucide-react';
import AuthForm, { type AuthFormValues } from '@/pages/Login/AuthForm';
import { register } from '@/apis/auth';
import { paths } from '@/router/paths';

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleSubmit = async (values: AuthFormValues) => {
    await register(values);
    navigate(paths.login, { replace: true });
  };

  return (
    <AuthForm
      icon={<UserPlus className="size-5" />}
      badge="Sign Up"
      title="注册"
      description="创建一个新账号"
      submitText="注册"
      loadingText="注册中…"
      passwordAutoComplete="new-password"
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
    />
  );
}
