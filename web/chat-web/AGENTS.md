# Repository Guidelines

## 项目结构与模块组织

这是一个基于 React 19、TypeScript 和 Vite 的前端项目。主要代码位于 `src/`：

- `src/pages/`：页面级功能，如登录、注册、首页和 404 页面。
- `src/components/`：可复用业务组件及 `components/ui/` 下的基础 UI 组件。
- `src/apis/`：Axios 接口封装、路径常量和接口类型。
- `src/router/`：路由配置与鉴权守卫；`src/stores/`：认证状态管理。
- `src/layouts/`、`src/utils/`、`src/lib/`、`src/config/`：布局、通用工具、样式辅助和配置。
- `src/assets/`、`public/`：构建时资源与静态资源；`docs/`：接口说明文档。

新增功能应优先放入对应领域目录，避免把页面逻辑、接口调用和通用组件混在同一文件中。

## 构建、测试与开发命令

先执行 `npm install` 安装依赖。常用命令如下：

- `npm run dev:dev`：以 dev 环境启动 Vite 开发服务器并启用 HMR。
- `npm run dev:sit` / `npm run dev:uat`：使用对应环境配置启动开发服务器。
- `npm run build:dev`、`npm run build:sit`、`npm run build:uat`、`npm run build:prod`：先执行 TypeScript 项目构建，再生成对应环境的生产包。
- `npm run lint`：运行 ESLint 检查 TypeScript/React 代码。
- `npm run preview`：本地预览已生成的构建产物。

当前 `package.json` 未配置自动化测试脚本或测试框架；提交前至少运行 `npm run lint`，并验证相关页面和鉴权流程。

## 编码风格与命名约定

使用 2 个空格缩进、单引号、语句分号、尾随逗号和 80 列宽，规则以 `.prettierrc` 为准；Tailwind 类名由 `prettier-plugin-tailwindcss` 排序。组件、页面和类型使用 PascalCase；变量、函数、路由路径使用 camelCase；文件名沿用现有 kebab-case 或目录约定。提交前运行 `npm run lint`，并保持 ESLint 与 Prettier 通过。

## 测试指南

项目目前没有配置测试框架或覆盖率门槛。若新增测试，建议按功能目录放置，使用 `*.test.ts` 或 `*.test.tsx` 命名，并在 `package.json` 中补充统一的测试命令。至少手动验证登录、注册、修改密码、权限失效自动登出和受保护路由。

## 提交与 Pull Request

Git 历史采用 Conventional Commits 风格，例如 `feat(auth): ...`、`fix(auth): ...`、`refactor(apis): ...`、`chore(eslint): ...`。提交信息应使用 `<type>(<scope>): <summary>`，摘要简洁、使用中文并说明实际变更。

Pull Request 应包含变更目的、主要实现点、验证命令及结果；涉及 UI 时附截图或录屏，涉及接口时说明环境配置或兼容性影响。提交前确认未包含 `.env`、密钥、`dist/` 或 `node_modules/`。

## 配置与安全提示

环境配置通过 `.env.*` 文件区分，新增变量时同步更新 `.env.example`，不要提交真实凭据。接口路径集中维护在 `src/apis/paths.ts`，公共请求行为放在 `src/utils/http.ts`，避免在页面中散落硬编码地址。
