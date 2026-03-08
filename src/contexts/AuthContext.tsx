import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isAuthenticated, clearToken } from "@/lib/api";

interface AuthContextType {
  authenticated: boolean;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  logout: () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);

  const logout = () => {
    clearToken();
    setAuthenticated(false);
  };

  const refresh = () => {
    setAuthenticated(isAuthenticated());
  };

  useEffect(() => {
    // Sync across tabs
    const handler = () => setAuthenticated(isAuthenticated());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
