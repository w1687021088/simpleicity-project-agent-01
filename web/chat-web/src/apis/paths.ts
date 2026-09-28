export const API_PATHS = {
  auth: {
    login: '/api/v1/system/auth/login',
    logout: '/api/v1/system/auth/logout',
    register: '/api/v1/system/auth/register',
  },
  user: {
    info: '/api/v1/system/user/info',
  },
} as const;
