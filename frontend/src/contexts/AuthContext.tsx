import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User } from '../services/authService';

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          // The interceptor in api.ts will add the token to this request
          const response = await api.get<User>('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('Session expired or token is invalid', error);
          // Clear invalid token
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    // Add a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 second timeout

    validateToken().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [token]); // Rerun when token changes

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', {
        identifiant: credentials.identifier,
        password: credentials.password,
      });

      const { access_token } = response.data;
      localStorage.setItem('authToken', access_token);

      // The useEffect will now run because setToken updates the token state.
      // It will then call /users/me to fetch the user data.
      setToken(access_token);
      toast.success('Logged in successfully!');

    } catch (error: any) {
      console.error('Login failed', error);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      // Re-throw the error so the form can update its state (e.g., stop isSubmitting)
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const authContextValue: AuthContextType = {
    isAuthenticated: !!user, // Base authentication on user object, not just token
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
