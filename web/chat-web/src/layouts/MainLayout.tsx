import { Link, Outlet, useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/auth';
import { logout } from '@/apis/auth';
import { paths } from '@/router/paths';

export default function MainLayout() {
  const navigate = useNavigate();
  const { clearToken } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 即使接口失败，前端也清 token
    } finally {
      clearToken();
      navigate(paths.login, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r p-4">
        <nav className="flex flex-1 flex-col gap-2 text-sm">
          <Link to={paths.home} className="hover:text-primary">
            首页
          </Link>
          <Link to={paths.users} className="hover:text-primary">
            用户列表
          </Link>
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          退出登录
        </Button>
      </aside>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
