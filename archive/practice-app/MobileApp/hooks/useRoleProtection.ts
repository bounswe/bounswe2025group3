import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import TokenManager from '@/app/tokenManager';

type Role = 'ADMIN' | 'MODERATOR' | 'USER';

/**
 * Hook to protect routes based on JWT token roles ONLY
 * @param requiredRoles Array of roles that are allowed to access this route
 * @param redirectPath Path to redirect to if user doesn't have required role
 */
export function useRoleProtection(requiredRoles: Role[], redirectPath = '/') {
  const router = useRouter();
  const [tokenRole, setTokenRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Get role directly from JWT token - THE ONLY source of truth
  useEffect(() => {
    async function checkTokenRole() {
      setIsLoading(true);
      try {
        const role = await TokenManager.getUserRoleFromToken();
        console.log(`[useRoleProtection] JWT token role: ${role}, required: [${requiredRoles.join(', ')}]`);
        
        setTokenRole(role);
        
        if (role && requiredRoles.includes(role as Role)) {
          console.log(`[useRoleProtection] Access granted: role ${role} is allowed`);
          setIsAuthorized(true);
        } else {
          console.error(`[useRoleProtection] Access denied: role ${role || 'unknown'} not in [${requiredRoles.join(', ')}]`);
          setIsAuthorized(false);
          
          // Show access denied and redirect
          Alert.alert(
            "Access Denied", 
            "You don't have permission to access this area.",
            [{ text: "OK", onPress: () => router.replace(redirectPath) }]
          );
        }
      } catch (error) {
        console.error("[useRoleProtection] Error checking token role:", error);
        setIsAuthorized(false);
        
        // Show error and redirect
        Alert.alert(
          "Authentication Error", 
          "There was a problem checking your permissions. Please try again.",
          [{ text: "OK", onPress: () => router.replace(redirectPath) }]
        );
      } finally {
        setIsLoading(false);
      }
    }
    
    checkTokenRole();
  }, [requiredRoles, redirectPath, router]);

  return {
    isAuthorized,
    isLoading,
    tokenRole
  };
} 