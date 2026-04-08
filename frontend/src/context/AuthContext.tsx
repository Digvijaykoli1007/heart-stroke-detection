import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextDefinition';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // FAKE LOGIN for local application as requested by user
    // In a real app, this would use Firebase Auth or similar.
    const fakeToken = 'mock-jwt-token-12345';
    const fakeUser: User = {
      id: 'usr123',
      email: email,
      name: 'Dr. Smith (Simulation)',
      role: 'DOCTOR'
    };

    setToken(fakeToken);
    setUser(fakeUser);
    
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('user', JSON.stringify(fakeUser));
  };

  const register = async (email: string, _password: string, name: string, role?: string) => {
    const fakeToken = 'mock-jwt-token-12345';
    const fakeUser: User = {
      id: 'usr123',
      email: email,
      name: name,
      role: (role as any) || 'DOCTOR'
    };

    setToken(fakeToken);
    setUser(fakeUser);
    
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('user', JSON.stringify(fakeUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
