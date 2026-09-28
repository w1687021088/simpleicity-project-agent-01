export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  users: '/users',
  userDetail: (id: number | string) => `/users/${id}`,
} as const;
