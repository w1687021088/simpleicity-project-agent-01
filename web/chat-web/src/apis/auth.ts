import { request } from '@/utils/http';

export const login = async () => {
  return request({
    url: '/login',
    method: 'post',
  });
};
