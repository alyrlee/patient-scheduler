import { createContext, useContext, useEffect, useState } from "react";

// API configuration for both development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Enhanced fetch with 429 error handling and backoff
async function fetchWithRetry(url, options = {}, retries = 3) {
  const response = await fetch(url, options);
  
  if (response.status === 429 && retries > 0) {
    // Get retry-after header or use exponential backoff
    const retryAfter = response.headers.get('retry-after');
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, 3 - retries) * 1000;
    
    console.warn(`Rate limited. Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return fetchWithRetry(url, options, retries - 1);
  }
  
  return response;
}

const AuthCtx = createContext({
  user: null,
  refresh: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function refresh() {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
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
      await fetchWithRetry(`${API_BASE_URL}/api/auth/logout`, { 
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
