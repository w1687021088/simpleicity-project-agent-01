import { request } from '@/utils/http';

export const getUserInfo = async () => {
  return request({
    url: '/api/v1/system/user/info',
    method: 'get',
  });
};
