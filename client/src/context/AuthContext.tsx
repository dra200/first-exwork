import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, login, register, logout } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'buyer' | 'seller';
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch current user
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 300000, // 5 minutes
    retry: false,
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        return null;
      }
    },
  });

  // Set initial loading state
  useEffect(() => {
    if (!isLoading) {
      setIsInitialLoading(false);
    }
  }, [isLoading]);

  // Login handler
  const handleLogin = async (email: string, password: string) => {
    try {
      const userData = await login(email, password);
      await refetch();
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Register handler
  const handleRegister = async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'buyer' | 'seller';
  }) => {
    try {
      const newUser = await register(userData);
      await refetch();
      toast({
        title: "Registration successful",
        description: `Welcome to TechConnect, ${newUser.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      queryClient.clear();
      toast({
        title: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user: user || null,
    isAuthenticated: !!user,
    isLoading: isInitialLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
