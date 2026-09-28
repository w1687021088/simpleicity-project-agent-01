import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/auth';
import { logout } from '@/apis/auth';
import { paths } from '@/router/paths';

export default function MainLayout() {
  const navigate = useNavigate();
  const { clearToken } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 忽略
    } finally {
      clearToken();
      navigate(paths.login, { replace: true });
    }
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-2 text-sm">
      <Link
        to={paths.home}
        className="rounded-md px-3 py-2 hover:bg-muted hover:text-primary"
        onClick={() => setOpen(false)}
      >
        首页
      </Link>
      <Link
        to={paths.users}
        className="rounded-md px-3 py-2 hover:bg-muted hover:text-primary"
        onClick={() => setOpen(false)}
      >
        用户列表
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* 移动端顶栏 */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="打开菜单"
        >
          <Menu className="size-5" />
        </Button>
        <span className="font-medium">Chat</span>
        <div className="w-8" /> {/* 占位，保持标题居中 */}
      </header>

      {/* 桌面端侧边栏 */}
      <aside className="hidden w-56 flex-col border-r p-4 md:flex">
        {nav}
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

      {/* 移动端抽屉 */}
      {open && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* 抽屉 */}
          <aside className="fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-background p-4 md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-medium">菜单</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="关闭菜单"
              >
                <X className="size-5" />
              </Button>
            </div>
            {nav}
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
        </>
      )}

      {/* 主内容区 */}
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
