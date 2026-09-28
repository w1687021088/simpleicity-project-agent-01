import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { HTTP, STORAGE_KEYS } from '@/config/constant';

// ---------- 类型定义 ----------

/** 字段级校验错误 */
export interface FieldError {
  field: string;
  msg: string;
}

/**
 * 后端统一响应结构（成功 & 失败共用）
 * - 成功：success=true, code=0, data=业务数据
 * - 失败：success=false, code=业务错误码, data=null，可带 path/request_id/errors
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
  /** 仅错误响应带 */
  path?: string;
  request_id?: string;
  errors?: FieldError[];
}

/** 单个查询参数允许的值类型 */
export type QueryValue =
  string | number | boolean | null | undefined | (string | number)[];

/** 查询参数对象 */
export type QueryParams = Record<string, QueryValue>;

/** 路径参数对象 */
export type PathParams = Record<string, string | number>;

/** 快捷方法的额外选项 */
export interface RequestOptions extends Omit<
  AxiosRequestConfig,
  'url' | 'method' | 'data' | 'params'
> {
  /** 路径参数，用于替换 url 中的 `:id` 或 `{id}` */
  pathParams?: PathParams;
}

// ---------- 业务错误类 ----------

export class ApiError extends Error {
  code: number;
  data: unknown;
  requestId?: string;
  errors?: FieldError[];
  httpStatus?: number;

  constructor(opts: {
    message: string;
    code: number;
    data?: unknown;
    requestId?: string;
    errors?: FieldError[];
    httpStatus?: number;
  }) {
    super(opts.message);
    this.name = 'ApiError';
    this.code = opts.code;
    this.data = opts.data;
    this.requestId = opts.requestId;
    this.errors = opts.errors;
    this.httpStatus = opts.httpStatus;
  }

  /** 是否为字段校验错误 */
  isValidationError(): boolean {
    return Array.isArray(this.errors) && this.errors.length > 0;
  }
}

// ---------- 参数处理 ----------

function cleanParams(
  params?: QueryParams,
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    result[key] = value;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * 替换路径参数，支持 `:id` 和 `{id}` 两种占位符
 */
export function buildPath(template: string, params: PathParams): string {
  const replace = (_: string, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`缺少路径参数: ${key}（模板: ${template}）`);
    }
    return encodeURIComponent(String(value));
  };
  return template.replace(/\{(\w+)}/g, replace).replace(/:(\w+)/g, replace);
}

function resolveConfig(
  url: string,
  options?: RequestOptions,
): { url: string; options: Omit<RequestOptions, 'pathParams'> } {
  const { pathParams, ...rest } = options ?? {};
  return {
    url: pathParams ? buildPath(url, pathParams) : url,
    options: rest,
  };
}

// ---------- 创建实例 ----------

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: HTTP.TIMEOUT,
  headers: {
    'Content-Type': HTTP.CONTENT_TYPE_JSON,
  },
  paramsSerializer: {
    indexes: null,
  },
});

// ---------- 请求拦截器 ----------

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `${HTTP.BEARER_PREFIX}${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------- 响应拦截器 ----------

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const body = response.data;

    // 后端业务错误：HTTP 200，但 success === false
    if (!body?.success) {
      return Promise.reject(
        new ApiError({
          message: body.message || '请求失败',
          code: body.code ?? -1,
          data: body.data,
          requestId: body.request_id,
          errors: body.errors,
          httpStatus: response.status,
        }),
      );
    }

    return response;
  },
  (error) => {
    const resp = error.response as AxiosResponse<ApiResponse> | undefined;

    // 401 未授权
    if (resp?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // 有响应（HTTP 4xx / 5xx）
    if (resp) {
      const body = resp.data;

      // body 可能是：正常对象 / 空字符串 / HTML / 其他非对象
      const isObject =
        body !== null && typeof body === 'object' && !Array.isArray(body);

      const bodyMessage = isObject ? (body as ApiResponse).message : undefined;
      const bodyCode = isObject ? (body as ApiResponse).code : undefined;
      const bodyData = isObject ? (body as ApiResponse).data : body;
      const bodyRequestId = isObject
        ? (body as ApiResponse).request_id
        : undefined;
      const bodyErrors = isObject ? (body as ApiResponse).errors : undefined;

      // 500 一律给友好中文，不暴露状态码
      const fallbackMessage =
        resp.status >= 500
          ? '服务器开小差了，请稍后重试'
          : error.message || `请求失败 (${resp.status})`;

      return Promise.reject(
        new ApiError({
          message: bodyMessage || fallbackMessage,
          code: bodyCode ?? resp.status,
          data: bodyData,
          requestId: bodyRequestId,
          errors: bodyErrors,
          httpStatus: resp.status,
        }),
      );
    }

    // 无响应：网络错误 / 超时 / CORS
    return Promise.reject(
      new ApiError({
        message: error.message || '网络异常，请稍后重试',
        code: -1,
      }),
    );
  },
);

// ---------- 底层方法 ----------

/**
 * 泛型请求：直接返回后端的 `data` 字段
 */
export async function request<T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response: AxiosResponse<ApiResponse<T>> =
    await instance.request(config);
  return response.data.data;
}

/**
 * 泛型请求：保留完整响应结构
 */
export async function requestRaw<T = unknown>(
  config: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response: AxiosResponse<ApiResponse<T>> =
    await instance.request(config);
  return response.data;
}

// ---------- 快捷方法 ----------

/** GET */
export function get<T = unknown>(
  url: string,
  params?: QueryParams,
  options?: RequestOptions,
): Promise<T> {
  const resolved = resolveConfig(url, options);
  return request<T>({
    ...resolved.options,
    url: resolved.url,
    method: 'GET',
    params: cleanParams(params),
  });
}

/** POST */
export function post<T = unknown>(
  url: string,
  data?: unknown,
  params?: QueryParams,
  options?: RequestOptions,
): Promise<T> {
  const resolved = resolveConfig(url, options);
  return request<T>({
    ...resolved.options,
    url: resolved.url,
    method: 'POST',
    data,
    params: cleanParams(params),
  });
}

/** PUT */
export function put<T = unknown>(
  url: string,
  data?: unknown,
  params?: QueryParams,
  options?: RequestOptions,
): Promise<T> {
  const resolved = resolveConfig(url, options);
  return request<T>({
    ...resolved.options,
    url: resolved.url,
    method: 'PUT',
    data,
    params: cleanParams(params),
  });
}

/** PATCH */
export function patch<T = unknown>(
  url: string,
  data?: unknown,
  params?: QueryParams,
  options?: RequestOptions,
): Promise<T> {
  const resolved = resolveConfig(url, options);
  return request<T>({
    ...resolved.options,
    url: resolved.url,
    method: 'PATCH',
    data,
    params: cleanParams(params),
  });
}

/** DELETE */
export function del<T = unknown>(
  url: string,
  params?: QueryParams,
  options?: RequestOptions,
): Promise<T> {
  const resolved = resolveConfig(url, options);
  return request<T>({
    ...resolved.options,
    url: resolved.url,
    method: 'DELETE',
    params: cleanParams(params),
  });
}

export default instance;
