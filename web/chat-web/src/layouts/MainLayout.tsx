import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  Sparkles,
  Settings,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/stores/auth';
import { logout } from '@/apis/auth';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

const SIDEBAR_KEY = 'sidebar-collapsed';
const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Chat';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [{ to: paths.home, label: '首页', icon: Home }];

function getInitial(
  user: { nickname?: string | null; username: string } | null,
) {
  if (!user) return '?';
  const name = user.nickname || user.username || '?';
  return name.charAt(0).toUpperCase();
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearToken, user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

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

  const handleSettings = () => {
    // 设置页就绪后：navigate(paths.settings)
  };

  const isActive = (to: string) => location.pathname === to;

  const displayName = user?.nickname || user?.username || '未登录';
  const initial = getInitial(user);

  /* ---------- 导航 ---------- */
  const desktopNav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              'hover:bg-muted hover:text-primary',
              active && 'bg-muted text-primary',
              collapsed && 'justify-center px-0',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span
              className={cn(
                'truncate transition-opacity duration-200',
                collapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100',
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  const mobileNav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
              'hover:bg-muted hover:text-primary',
              active && 'bg-muted text-primary',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  /* ---------- 用户菜单内容（桌面 + 移动共用） ---------- */
  const userMenuContent = (
    <DropdownMenuContent
      side="right"
      align="end"
      sideOffset={8}
      className="w-48"
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Avatar className="size-8">
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{displayName}</p>
          {user?.email && (
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          )}
        </div>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={handleSettings}>
        <Settings className="size-4" />
        设置
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={handleLogout}
        className="text-destructive focus:text-destructive"
      >
        <LogOut className="size-4" />
        退出登录
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  /* ---------- 桌面端用户区 ---------- */
  const desktopUser = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="用户菜单"
            className={cn(
              'flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-muted',
              collapsed && 'justify-center',
            )}
          />
        }
      >
        <Avatar className="size-8 shrink-0">
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-sm font-medium transition-opacity duration-200',
            collapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100',
          )}
        >
          {displayName}
        </span>
        {!collapsed && (
          <MoreHorizontal className="size-4 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      {userMenuContent}
    </DropdownMenu>
  );

  /* ---------- 移动端用户区 ---------- */
  const mobileUser = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="用户菜单"
            className="flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-muted"
          />
        }
      >
        <Avatar className="size-8 shrink-0">
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {displayName}
        </span>
        <MoreHorizontal className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      {userMenuContent}
    </DropdownMenu>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* 移动端顶栏 */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="打开菜单"
        >
          <Menu className="size-5" />
        </Button>
        <span className="font-medium">{APP_TITLE}</span>
        <div className="w-8" />
      </header>

      {/* 桌面端侧边栏 */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r py-4 transition-all duration-300 ease-in-out md:flex',
          collapsed ? 'w-16 px-2' : 'w-56 px-4',
        )}
      >
        {/* 顶部：Logo + 项目名 + 折叠 */}
        <div
          className={cn(
            'mb-4 flex items-center gap-2',
            collapsed ? 'flex-col' : 'flex-row',
          )}
        >
          <Link
            to={paths.home}
            className={cn(
              'flex items-center gap-2 overflow-hidden rounded-md',
              collapsed ? 'justify-center' : 'min-w-0 flex-1',
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span
              className={cn(
                'truncate text-sm font-semibold transition-opacity duration-200',
                collapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100',
              )}
            >
              {APP_TITLE}
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
            className="shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        <div className="mb-2 h-px bg-border/60" />

        {desktopNav}

        {/* 底部：用户区 */}
        <div className="mt-2 border-t border-border/60 pt-2">{desktopUser}</div>
      </aside>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-background p-4 md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <Link
                to={paths.home}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-sm font-semibold">{APP_TITLE}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="关闭菜单"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="mb-2 h-px bg-border/60" />

            {mobileNav}

            <div className="mt-2 border-t border-border/60 pt-2">
              {mobileUser}
            </div>
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
