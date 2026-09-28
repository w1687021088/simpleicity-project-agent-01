import { get, post } from '@/utils/http';

// ---------- 类型 ----------

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
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
  post<LoginResponse>('/api/v1/system/auth/login', data);

/** 登出 */
export const logout = () => post<void>('/api/v1/system/auth/logout');

/** 注册 */
export const register = (data: LoginRequest) =>
  post<void>('/api/v1/system/auth/register', data);

/** 获取当前用户 */
export const getCurrentUser = () => get<UserInfo>('/api/v1/system/user/info');
