# http.ts 使用文档

基于 Axios 封装，适配后端统一响应结构，提供类型安全、参数清理、路径参数和快捷方法。

- 文件：`src/utils/http.ts`
- 依赖：`axios`
- 环境变量：`VITE_API_BASE_URL`

---

## 分层约定

业务代码**不直接调用** `http.ts`，而是在 `src/apis/` 下按模块封装。

```
src/
├── utils/
│   └── http.ts              # 底层请求封装
├── apis/
│   ├── user.ts              # 用户模块 API
│   ├── auth.ts              # 认证模块 API
│   ├── types/
│   │   ├── user.ts          # 用户相关类型
│   │   └── auth.ts          # 认证相关类型
│   └── index.ts             # 统一导出
└── pages/ or components/    # 业务代码只 import apis
```

**好处**：

- 请求方法、参数类型、返回类型集中管理，复用方便
- 业务层只关心 `userApi.list()`，不关心 URL、method、参数结构
- 接口变更只改 `apis/`，不改业务代码
- 类型定义和请求方法放一起，IDE 跳转方便

---

## 快速开始

```ts
import { get, post, put, patch, del } from '@/utils/http';

// GET
const users = await get<User[]>('/users', { page: 1, size: 10 });

// POST
const newUser = await post<User>('/users', { name: 'Alice' });

// PUT
await put<User>('/users/1', { name: 'Bob' });

// PATCH
await patch<User>('/users/1', { name: 'Bob' });

// DELETE
await del<void>('/users/1');
```

---

## 方法速查

| 方法 | 签名 | 说明 |
|------|------|------|
| `get<T>` | `(url, params?, options?)` | 查询参数自动清理 |
| `post<T>` | `(url, data?, params?, options?)` | 支持同时带 query |
| `put<T>` | `(url, data?, params?, options?)` | 同上 |
| `patch<T>` | `(url, data?, params?, options?)` | 同上 |
| `del<T>` | `(url, params?, options?)` | 支持 query |
| `request<T>` | `(config)` | 底层方法，返回 `data` |
| `requestRaw<T>` | `(config)` | 底层方法，返回完整响应 |

---

## 路径参数

```ts
// :id 风格
await get<User>('/users/:id', undefined, { pathParams: { id: 1 } });

// {id} 风格（FastAPI 文档习惯）
await get<User>('/users/{id}', undefined, { pathParams: { id: 1 } });

// 多个路径参数
await post<void>('/users/:uid/roles/:rid', undefined, undefined, {
  pathParams: { uid: 1, rid: 2 },
});
```

也可手动构建：

```ts
import { buildPath } from '@/utils/http';
const url = buildPath('/users/:id/posts/:pid', { id: 1, pid: 2 });
```

---

## 查询参数

自动移除 `undefined`、`null`、空字符串、空数组。

```ts
await get('/users', { page: 1, keyword: undefined, tags: [] });
// 实际请求：/users?page=1
```

数组序列化为 `key=v1&key=v2`：

```ts
await get('/users/batch', { ids: [1, 2, 3] });
// 实际请求：/users/batch?ids=1&ids=2&ids=3
```

---

## 错误处理

所有错误均为 `ApiError`。

```ts
import { get, ApiError } from '@/utils/http';

try {
  await get('/users/1');
} catch (e) {
  if (e instanceof ApiError) {
    console.error(e.code, e.message);

    if (e.isValidationError()) {
      e.errors?.forEach(({ field, msg }) => console.log(field, msg));
    }
  }
}
```

`ApiError` 属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `message` | `string` | 错误信息 |
| `code` | `number \| string` | 业务码或 HTTP 状态码 |
| `data` | `unknown` | 附加数据 |
| `requestId` | `string?` | 后端 request_id |
| `errors` | `FieldError[]?` | 字段校验错误 |
| `httpStatus` | `number?` | HTTP 状态码 |

---

## 完整响应结构

需要读取 `code`、`message`、`timestamp` 时：

```ts
import { requestRaw } from '@/utils/http';

const { code, message, timestamp, data } = await requestRaw<User[]>('/users');
```

---

## 业务层封装（src/apis）

### 1. 定义类型

`src/apis/types/user.ts`：

```ts
/** 用户实体 */
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

/** 列表查询参数 */
export interface UserListQuery {
  page?: number;
  size?: number;
  keyword?: string;
  status?: 'active' | 'disabled';
}

/** 创建用户入参 */
export interface UserCreateBody {
  name: string;
  email: string;
  password: string;
}

/** 更新用户入参 */
export interface UserUpdateBody {
  name?: string;
  email?: string;
}
```

### 2. 封装 API

`src/apis/user.ts`：

```ts
import { get, post, put, del } from '@/utils/http';
import type {
  User,
  UserListQuery,
  UserCreateBody,
  UserUpdateBody,
} from './types/user';

export const userApi = {
  /** 获取用户列表 */
  list(query?: UserListQuery) {
    return get<User[]>('/users', query);
  },

  /** 获取用户详情 */
  detail(id: number) {
    return get<User>('/users/:id', undefined, { pathParams: { id } });
  },

  /** 创建用户 */
  create(body: UserCreateBody) {
    return post<User>('/users', body);
  },

  /** 更新用户 */
  update(id: number, body: UserUpdateBody) {
    return put<User>('/users/:id', body, undefined, { pathParams: { id } });
  },

  /** 删除用户 */
  remove(id: number) {
    return del<void>('/users/:id', undefined, { pathParams: { id } });
  },

  /** 批量删除 */
  batchRemove(ids: number[]) {
    return del<void>('/users', { ids });
  },
};
```

### 3. 统一导出

`src/apis/index.ts`：

```ts
export * from './user';
export * from './auth';
export * from './types/user';
export * from './types/auth';
```

### 4. 业务层调用

```ts
import { userApi, type User } from '@/apis';

// 列表
const users = await userApi.list({ page: 1, size: 10 });

// 详情
const user = await userApi.detail(1);

// 创建
const created = await userApi.create({
  name: 'Alice',
  email: 'alice@example.com',
  password: '123456',
});

// 更新
await userApi.update(1, { name: 'Bob' });

// 删除
await userApi.remove(1);
```

---

## 命名规范建议

| 层级 | 文件 | 命名 | 示例 |
|------|------|------|------|
| 底层 | `utils/http.ts` | 通用方法 | `get` / `post` |
| 模块 | `apis/user.ts` | `xxxApi` 对象 | `userApi` |
| 类型 | `apis/types/user.ts` | `XxxQuery` / `XxxBody` / `Xxx` | `UserListQuery` |
| 视图 | `pages/UserList.tsx` | 组件 | `UserList` |

**方法命名约定**：

- `list` / `page`：列表 / 分页
- `detail` / `get`：详情
- `create` / `add`：创建
- `update` / `edit`：全量更新
- `patch`：部分更新
- `remove` / `delete`：删除
- `batchRemove`：批量删除

---

## 自定义配置

快捷方法最后一个参数可传任意 Axios 配置：

```ts
// 上传文件
await post('/upload', formData, undefined, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// 自定义超时
await get('/slow', undefined, { timeout: 30000 });

// 取消请求
const controller = new AbortController();
get('/users', undefined, { signal: controller.signal });
controller.abort();
```

---

## 常见场景

```ts
// 路径 + 查询
await get<Post[]>('/users/:id/posts', { page: 1 }, { pathParams: { id: 1 } });
// GET /users/1/posts?page=1

// 批量删除
await del<void>('/users', { ids: [1, 2, 3] });
// DELETE /users?ids=1&ids=2&ids=3

// 底层请求（完全自定义）
import { request } from '@/utils/http';
const res = await request<{ url: string }>({
  url: '/upload',
  method: 'POST',
  data: formData,
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

---

## 配置说明

- `baseURL`：`import.meta.env.VITE_API_BASE_URL`
- 超时：10 秒
- 请求头：自动带 `Authorization: Bearer <token>`（从 `localStorage` 读取）
- 数组序列化：`paramsSerializer: { indexes: null }`
- 401 处理：响应拦截器已预留跳转登录注释，按需启用
