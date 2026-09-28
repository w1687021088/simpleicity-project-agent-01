import { useNavigate } from 'react-router';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/router/paths';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground">
      {/* 背景网格 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* 中心光晕 */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.03] blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* 超大号 404 */}
        <div className="relative">
          <h1
            className="font-heading text-[10rem] leading-none font-black tracking-tighter select-none sm:text-[14rem]"
            style={{
              WebkitTextStroke: '1px currentColor',
              color: 'transparent',
            }}
          >
            404
          </h1>
          {/* 实心叠层，制造层次 */}
          <span className="absolute inset-0 flex items-center justify-center text-[10rem] leading-none font-black tracking-tighter text-foreground/5 select-none sm:text-[14rem]">
            404
          </span>
        </div>

        {/* 分隔线 */}
        <div className="mt-2 h-px w-16 bg-border" />

        <h2 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
          页面走丢了
        </h2>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          你访问的页面不存在，或者已经被移动到别处。请检查地址是否正确，或返回首页继续浏览。
        </p>

        {/* 操作按钮 */}
        <div className="mt-8 flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            返回上一页
          </Button>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => navigate(paths.home)}
          >
            <Home className="size-4" />
            回到首页
          </Button>
        </div>

        {/* 底部提示 */}
        <p className="mt-12 font-mono text-xs text-muted-foreground/60">
          ERROR_CODE · 404 · NOT_FOUND
        </p>
      </div>
    </div>
  );
}
