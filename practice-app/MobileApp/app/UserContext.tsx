import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import TokenManager from './tokenManager';
import { API_ENDPOINTS } from '@/constants/api';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  date_joined: string;
  notifications_enabled: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  fetchUserProfile: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const isAuthenticated = await TokenManager.hasValidTokens();
      
      if (!isAuthenticated) {
        console.log("Authentication failed - no valid tokens");
        setUser(null);
        return;
      }

      // Get role from JWT token first
      const tokenRole = await TokenManager.getUserRoleFromToken();
      console.log("Role from JWT token:", tokenRole);

      console.log("Fetching user profile...");
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE);
      
      if (response.ok) {
        const data = await response.json();
        // Debug the user data being received from backend
        console.log("USER DATA FROM API:", JSON.stringify(data, null, 2));
        console.log(`Role received from API: ${data.role}`);
        
        // Check if roles match
        if (tokenRole && data.role && tokenRole !== data.role) {
          console.error(`ROLE MISMATCH: Token role (${tokenRole}) doesn't match API role (${data.role})`);
          // Force relogin to fix the token issue
          await TokenManager.clearTokens();
          setUser(null);
          return;
        }
        
        setUser(data);
      } else {
        console.error('Failed to fetch user profile:', response.status);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const value = {
    user,
    isLoading,
    fetchUserProfile,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}; 