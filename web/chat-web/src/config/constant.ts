/** localStorage 存储键 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
} as const;

/** HTTP 相关常量 */
export const HTTP = {
  /** 请求超时（毫秒） */
  TIMEOUT: 10000,
  /** 认证头前缀 */
  BEARER_PREFIX: 'Bearer ',
  /** 认证头字段 */
  AUTHORIZATION_HEADER: 'Authorization',
  /** JSON Content-Type */
  CONTENT_TYPE_JSON: 'application/json',
} as const;

/** 路由路径 —— 已在 router/paths.ts 维护，这里不再重复 */

/** 分页默认值 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
} as const;
