import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { api } from "../lib/api";

interface AuthUser {
  id: number;
  username: string;
  nome: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("aponta_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.me().then(setUser).catch(() => { setToken(null); localStorage.removeItem("aponta_token"); }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await api.login({ username, password });
    localStorage.setItem("aponta_token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("aponta_token");
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
