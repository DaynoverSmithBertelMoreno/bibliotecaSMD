import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, UserInfo } from '../api/admin-api';

type AuthState = {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState>({
  user: null, token: null, loading: true,
  login: async () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('smd_token');
    if (saved) {
      setToken(saved);
      authApi.me()
        .then(setUser)
        .catch(() => { localStorage.removeItem('smd_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (usuario: string, password: string) => {
    const { token: t, user: u } = await authApi.login(usuario, password);
    localStorage.setItem('smd_token', t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('smd_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
