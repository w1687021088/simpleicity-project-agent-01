import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { cn } from 'cn';

export type AuthVariant = 'login' | 'register';

interface AuthBrandProps {
  variant?: AuthVariant;
}

const registerHints = [
  {
    title: '设置登录信息',
    description: '用户名和密码用于后续登录。',
  },
  {
    title: '补充可选资料',
    description: '昵称、手机号和邮箱可以稍后完善。',
  },
  {
    title: '进入聊天空间',
    description: '注册成功后会直接进入系统。',
  },
];

export default function AuthBrand({ variant = 'login' }: AuthBrandProps) {
  const isRegister = variant === 'register';

  if (isRegister) {
    return (
      <aside className="hidden min-h-full flex-col justify-between border-l bg-muted/40 p-10 lg:flex xl:p-14">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <MessageCircle className="size-4" aria-hidden="true" />
            </span>
            Simpleicity
          </div>

          <div className="mt-24 max-w-md">
            <p className="mb-5 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              创建账户
            </p>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight xl:text-4xl">
              准备好开始
              <br />
              <span className="text-muted-foreground">一段新的对话了吗？</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground">
              填写基础账号信息即可开始使用，其余资料可以按需补充。
            </p>

            <ol className="mt-10 flex flex-col gap-5">
              {registerHints.map((hint, index) => (
                <li key={hint.title} className="flex gap-4">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                      index === 0
                        ? 'border-foreground bg-foreground text-background'
                        : 'bg-background text-muted-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{hint.title}</span>
                    <span className="text-xs leading-5 text-muted-foreground">
                      {hint.description}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-5 text-xs text-muted-foreground">
          <span>© 2026 Simpleicity</span>
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden min-h-full flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex xl:p-14">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground text-primary">
            <MessageCircle className="size-4" aria-hidden="true" />
          </span>
          Simpleicity
        </div>
        <div className="mt-32 max-w-md">
          <p className="mb-5 text-sm font-medium text-primary-foreground/60">
            欢迎回来
          </p>
          <h2 className="text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
            让沟通回到
            <br />
            <span className="text-primary-foreground/60">简单本身。</span>
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-6 text-primary-foreground/65">
            一个安静、可靠的地方，记录想法，也和重要的人保持联系。
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-primary-foreground/15 pt-5 text-xs text-primary-foreground/50">
        <span>© 2026 Simpleicity</span>
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </div>
    </aside>
  );
}
