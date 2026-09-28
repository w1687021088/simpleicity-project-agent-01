import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/config/constant';
import { getCurrentUser, type UserInfo } from '@/apis';

interface AuthContextValue {
  token: string | null;
  user: UserInfo | null;
  loading: boolean;
  setToken: (t: string) => void;
  setUser: (u: UserInfo) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.TOKEN),
  );
  const [user, setUserState] = useState<UserInfo | null>(null);

  // 初始有 token 就处于"待拉取"状态
  const [loading, setLoading] = useState<boolean>(
    () => !!localStorage.getItem(STORAGE_KEYS.TOKEN),
  );

  const setToken = useCallback((t: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, t);
    setTokenState(t);
  }, []);

  const setUser = useCallback((u: UserInfo) => {
    setUserState(u);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setTokenState(null);
    setUserState(null);
  }, []);

  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, user, setUser, clearToken]);

  const value = useMemo(
    () => ({ token, user, loading, setToken, setUser, clearToken }),
    [token, user, loading, setToken, setUser, clearToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 <AuthProvider> 内使用');
  return ctx;
}
