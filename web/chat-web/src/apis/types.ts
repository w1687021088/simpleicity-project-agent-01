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

/** 登录响应 */
export interface LoginResponse extends UserInfo {
  token: string;
}

/** 注册响应 */
export interface RegisterResponse extends UserInfo {
  token: string;
}

/** 修改密码请求体 */
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}
