import { STORAGE_KEYS } from '@/config/constant';

/** 清除本地所有认证信息 */
export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

/** 跳转登录页（已在登录页则不跳） */
export function redirectToLogin(): void {
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

/**
 * 强制登出：清 token + 跳登录
 * @param delay 延迟毫秒数（用于让 toast 先显示出来再跳转）
 */
export function forceLogout(delay = 0): void {
  clearAuth();

  if (delay > 0) {
    setTimeout(redirectToLogin, delay);
  } else {
    redirectToLogin();
  }
}
