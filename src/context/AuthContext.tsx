import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../data/models/User';
import { MockAuthRepository } from '../data/repositories/auth/MockAuthRepository';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (dni: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

const authRepository = new MockAuthRepository();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authRepository.getCurrentUser().then(u => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (dni: string, password: string): Promise<boolean> => {
    const result = await authRepository.login(dni, password);
    if (result) {
      setUser(result);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await authRepository.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
