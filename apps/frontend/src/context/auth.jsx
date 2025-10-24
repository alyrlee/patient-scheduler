import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext({
  user: null,
  refresh: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function refresh() {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        setUser(await response.json());
      } else if (response.status === 401) {
        // 401 is expected when user is not logged in - don't log as error
        setUser(null);
      } else {
        console.warn('Auth check failed with status:', response.status);
        setUser(null);
      }
    } catch (error) {
      console.warn('Auth check failed:', error.message);
      setUser(null);
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  }

  useEffect(() => { 
    refresh(); 
  }, []);

  return (
    <AuthCtx.Provider value={{ user, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
