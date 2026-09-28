import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/config/constant';
import type { UserInfo } from '@/apis/auth';

const USER_KEY = 'user';

interface AuthContextValue {
  token: string | null;
  user: UserInfo | null;
  setToken: (t: string) => void;
  setUser: (u: UserInfo) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.TOKEN),
  );

  const [user, setUserState] = useState<UserInfo | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserInfo;
    } catch {
      return null;
    }
  });

  const setToken = useCallback((t: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, t);
    setTokenState(t);
  }, []);

  const setUser = useCallback((u: UserInfo) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUserState(u);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUserState(null);
  }, []);

  // TODO: 查询用户信息接口就绪后，在这里补一次调用
  // useEffect(() => {
  //   if (token && !user) {
  //     getCurrentUser()
  //       .then((u) => setUser(u))
  //       .catch(() => clearToken());
  //   }
  // }, [token, user, setUser, clearToken]);

  const value = useMemo(
    () => ({ token, user, setToken, setUser, clearToken }),
    [token, user, setToken, setUser, clearToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 <AuthProvider> 内使用');
  return ctx;
}
