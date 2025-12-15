// This page is directly copied from expo documentations. and improved for our own use.

import { createContext, use, type PropsWithChildren, useEffect, useState } from 'react';
import { useStorageState } from './useStorageState';
import tokenManager from '@/services/tokenManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

const AuthContext = createContext<{
  signIn: (role:UserRole) => void;
  signOut: () => void;
  session?: string | null;
  userRole?: UserRole | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => undefined,
  userRole: null,
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [[roleLoading, userRole], setUserRole] = useStorageState('userRole');
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const isLoggedIn = await tokenManager.autoLogin();
        if (!isMounted) return;
        setSession(isLoggedIn ? 'authenticated' : null);
      } catch {
        if (!isMounted) return;
        setSession(null);
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [setSession]);

  return (
    <AuthContext
      value={{
        signIn: (role: UserRole) => {
          setSession('authenticated');
          setUserRole(role);
        },
        signOut: async () => {
          tokenManager.clearTokens().catch((error) => {
            console.error('Failed to clear tokens on sign out:', error);
          });
          // Clear all user-specific badge shown IDs and initialization flags on logout
          try {
            const keys = await AsyncStorage.getAllKeys();
            const badgeKeys = keys.filter(key => 
              key.startsWith('@shown_badge_ids_') || 
              key === '@shown_badge_ids' ||
              key.startsWith('@badge_system_initialized_') ||
              key === '@badge_system_initialized'
            );
            if (badgeKeys.length > 0) {
              await AsyncStorage.multiRemove(badgeKeys);
            }
          } catch (error) {
            console.error('Error clearing badge IDs on logout:', error);
          }
          setSession(null);
          setUserRole(null);
        },
        userRole: userRole as UserRole | null,
        session,
        isLoading: isLoading || roleLoading || isBootstrapping,
      }}>
      {children}
    </AuthContext>
  );
}
