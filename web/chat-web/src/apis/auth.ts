import { get, post } from '@/utils/http';
import { API_PATHS } from './paths';

// ---------- 类型 ----------

export interface LoginRequest {
  username: string;
  password: string;
}

/** 注册请求体 */
export interface RegisterRequest {
  username: string;
  password: string;
  confirm_password: string;
  phone?: string;
  email?: string;
  nickname?: string;
}

/** 用户信息 */
export interface UserInfo {
  user_id: string;
  username: string;
  phone: string | null;
  email: string | null;
  nickname: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/** 登录响应 —— 对齐 AuthLoginResponse */
export interface LoginResponse extends UserInfo {
  token: string;
}

/** 注册响应 —— 对齐 AuthRegisterResponse */
export interface RegisterResponse extends UserInfo {
  token: string;
}

// ---------- 接口 ----------

/** 登录 */
export const login = (data: LoginRequest) =>
  post<LoginResponse>(API_PATHS.auth.login, data);

/** 登出 */
export const logout = () => post<void>(API_PATHS.auth.logout);

/** 注册 */
export const register = (data: RegisterRequest) =>
  post<RegisterResponse>(API_PATHS.auth.register, data);

/** 获取当前用户 */
export const getCurrentUser = () => get<UserInfo>(API_PATHS.user.info);
