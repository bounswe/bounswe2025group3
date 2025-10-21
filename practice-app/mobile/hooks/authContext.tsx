// This page is directly copied from expo documentations.

import { createContext, use, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';

type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

const AuthContext = createContext<{
  signIn: (role:UserRole) => void;
  signOut: () => void;
  session?: string | null;
  userRole?: UserRole | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  userRole: null,
  session: null,
  isLoading: false,
});

// Use this hook to access the user info.
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

  return (
    <AuthContext
      value={{
        signIn: (role: UserRole) => {
          // Perform sign-in logic here
          setSession('xxx');
          setUserRole(role);
        },
        signOut: () => {
          setSession(null);
          setUserRole(null);
        },
        userRole: userRole as UserRole | null,
        session,
        isLoading: isLoading || roleLoading,
      }}>
      {children}
    </AuthContext>
  );
}
