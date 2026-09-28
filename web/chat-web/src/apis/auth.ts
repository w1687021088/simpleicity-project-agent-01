import { get, post } from '@/utils/http';
import { API_PATHS } from './paths';

// ---------- 类型 ----------

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/** 注册请求体 —— 对齐后端 AuthRegisterBody */
export interface RegisterRequest {
  username: string;
  password: string;
  confirm_password: string;
  /** 手机号，可选，11 位数字 */
  phone?: string;
  /** 邮箱，可选 */
  email?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

// ---------- 接口 ----------

/** 登录 */
export const login = (data: LoginRequest) =>
  post<LoginResponse>(API_PATHS.auth.login, data);

/** 登出 */
export const logout = () => post<void>(API_PATHS.auth.logout);

/** 注册 */
export const register = (data: RegisterRequest) =>
  post<void>(API_PATHS.auth.register, data);

/** 获取当前用户 */
export const getCurrentUser = () => get<UserInfo>(API_PATHS.user.info);
