// src/utils/http.ts
import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

// 创建实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
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

// 响应拦截器（按需调整）
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果后端统一返回 { code, data, message }，可以在这里解包：
    // const { code, data, message } = response.data;
    // if (code !== 0) {
    //   return Promise.reject(new Error(message));
    // }
    // return data; // 这样 request 拿到的就是 data
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权，例如跳转登录
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/**
 * 泛型 request
 * @param config Axios 请求配置
 * @returns Promise<T> 直接返回响应体数据
 */
export async function request<T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response: AxiosResponse<T> = await instance.request<T>(config);
  return response.data;
}

export default instance;
