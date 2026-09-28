import { post } from '@/utils/http';
import { API_PATHS } from './paths';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from './types';
// ---------- 接口 ----------

/** 登录 */
export const login = (data: LoginRequest) =>
  post<LoginResponse>(API_PATHS.auth.login, data);

/** 登出 */
export const logout = () => post<void>(API_PATHS.auth.logout);

/** 注册 */
export const register = (data: RegisterRequest) =>
  post<RegisterResponse>(API_PATHS.auth.register, data);
