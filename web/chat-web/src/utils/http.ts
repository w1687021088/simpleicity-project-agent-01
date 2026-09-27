// src/utils/http.ts
import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

// ---------- 类型定义 ----------

/** 字段级校验错误 */
export interface FieldError {
  field: string;
  msg: string;
}

/** 后端统一响应结构（成功 & 失败共用） */
export interface ApiResponse<T = unknown> {
  code: number | string;
  data: T;
  message: string;
  timestamp: string;
  /** 仅错误响应会带，success: false 表示业务失败 */
  success?: boolean;
  path?: string;
  request_id?: string;
  /** 参数校验错误详情 */
  errors?: FieldError[];
}

// ---------- 业务错误类 ----------

export class ApiError extends Error {
  code: number | string;
  data: unknown;
  requestId?: string;
  errors?: FieldError[];
  httpStatus?: number;

  constructor(opts: {
    message: string;
    code: number | string;
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

// ---------- 创建实例 ----------

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- 请求拦截器 ----------

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------- 响应拦截器 ----------

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const body = response.data;

    // 后端业务错误：HTTP 200，但 body.success === false
    if (body?.success === false) {
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

    // 401 未授权：按需处理跳转登录
    if (resp?.status === 401) {
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }

    // 服务端返回了响应体（如 400 / 500，或 FastAPI 兜底 500）
    if (resp) {
      const body = resp.data;
      return Promise.reject(
        new ApiError({
          message:
            body?.message || error.message || `请求失败 (${resp.status})`,
          code: body?.code ?? resp.status,
          data: body?.data,
          requestId: body?.request_id,
          errors: body?.errors,
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

// ---------- 泛型 request ----------

/**
 * 泛型请求：直接返回后端的 `data` 字段
 *
 * @example
 *   const user = await request<User>({ url: '/user/1', method: 'GET' });
 *   const list = await request<User[]>({ url: '/users', method: 'GET' });
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
 * 需要读取 code / message / timestamp 时使用
 *
 * @example
 *   const { code, message, data } = await requestRaw<User[]>({ url: '/users' });
 */
export async function requestRaw<T = unknown>(
  config: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response: AxiosResponse<ApiResponse<T>> =
    await instance.request(config);
  return response.data;
}

export default instance;
