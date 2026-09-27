import { get } from '@/utils/http';

export const getUserInfo = async () => {
  return get('/api/v1/system/user/info');
};
