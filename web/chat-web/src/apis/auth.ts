import { request } from '@/utils/http';

// 登录
export const login = async () => {
  return request({
    url: '/api/v1/system/auth/login',
    method: 'post',
  });
};

// 登出
export const logout = async () => {
  return request({
    url: '/api/v1/system/auth/logout',
    method: 'post',
  });
};

// 注册
export const register = async () => {
  return request({
    url: '/api/v1/system/auth/register',
    method: 'post',
  });
};
