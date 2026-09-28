import { get, post } from '@/utils/http';
import { API_PATHS } from '@/apis/paths.ts';
import type { UserInfo, ChangePasswordRequest } from './types';

/** 获取当前用户 */
export const getCurrentUser = () => get<UserInfo>(API_PATHS.user.info);

/** 修改密码 */
export const changePassword = (data: ChangePasswordRequest) =>
  post<void>(API_PATHS.user.changePassword, data);
