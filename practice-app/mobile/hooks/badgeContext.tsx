import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyBadges, Badge } from '@/api/badges';
import { getUserProfile } from '@/api/user';
import BadgePopup from '@/components/ui/badge-popup';
import { useSession } from '@/hooks/authContext';

interface BadgeContextType {
  checkForNewBadges: () => Promise<void>;
  isChecking: boolean;
  clearShownBadges: () => Promise<void>;
}

const BadgeContext = createContext<BadgeContextType>({
  checkForNewBadges: async () => {},
  isChecking: false,
  clearShownBadges: async () => {},
});

const getShownBadgesKey = (userId: number | null): string => {
  if (userId) {
    return `@shown_badge_ids_${userId}`;
  }
  return '@shown_badge_ids';
};

const getInitializedKey = (userId: number | null): string => {
  if (userId) {
    return `@badge_system_initialized_${userId}`;
  }
  return '@badge_system_initialized';
};

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { session } = useSession();
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get user ID when session is available
  useEffect(() => {
    const fetchUserId = async () => {
      if (session) {
        try {
          const profile = await getUserProfile();
          setUserId(profile.id);
        } catch (error) {
          console.error('Error fetching user profile for badge context:', error);
        }
      } else {
        setUserId(null);
      }
    };
    fetchUserId();
  }, [session]);

  const getShownBadgeIds = useCallback(async (): Promise<Set<string>> => {
    if (!userId) return new Set<string>();
    try {
      const key = getShownBadgesKey(userId);
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        return new Set(ids);
      }
    } catch (error) {
      console.error('Error loading shown badge IDs:', error);
    }
    return new Set<string>();
  }, [userId]);

  const saveShownBadgeId = useCallback(async (badgeId: string | number) => {
    if (!userId) return;
    try {
      const shownIds = await getShownBadgeIds();
      shownIds.add(String(badgeId));
      const key = getShownBadgesKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(shownIds)));
    } catch (error) {
      console.error('Error saving shown badge ID:', error);
    }
  }, [getShownBadgeIds, userId]);

  const clearShownBadges = useCallback(async () => {
    if (!userId) return;
    try {
      const key = getShownBadgesKey(userId);
      const initializedKey = getInitializedKey(userId);
      await AsyncStorage.removeItem(key);
      await AsyncStorage.removeItem(initializedKey);
    } catch (error) {
      console.error('Error clearing shown badge IDs:', error);
    }
  }, [userId]);

  const checkForNewBadges = useCallback(async () => {
    if (isChecking || !userId) return;
    
    setIsChecking(true);
    try {
      const badges = await getMyBadges();
      if (!Array.isArray(badges) || badges.length === 0) {
        setIsChecking(false);
        return;
      }

      const shownIds = await getShownBadgeIds();
      const initializedKey = getInitializedKey(userId);
      const isInitialized = await AsyncStorage.getItem(initializedKey);
      
      // If this is the first time checking badges (e.g., first app launch or new user),
      // mark all existing badges as "shown" to prevent showing old badges as pop-ups
      if (!isInitialized) {
        const existingBadgeIds: string[] = [];
        badges.forEach((badge) => {
          const badgeInfo = badge.badge || badge;
          const badgeId = String(badgeInfo.id || badge.id);
          const earnedAt = badge.earned_at || badge.achieved_at;
          if (earnedAt) {
            existingBadgeIds.push(badgeId);
          }
        });
        
        if (existingBadgeIds.length > 0) {
          const key = getShownBadgesKey(userId);
          await AsyncStorage.setItem(key, JSON.stringify(existingBadgeIds));
          await AsyncStorage.setItem(initializedKey, 'true');
        }
        setIsChecking(false);
        return; // Don't show any pop-ups on first initialization
      }
      
      // Find newly earned badges (have earned_at and not shown before)
      const newBadges = badges.filter((badge) => {
        const badgeInfo = badge.badge || badge;
        const badgeId = String(badgeInfo.id || badge.id);
        const earnedAt = badge.earned_at || badge.achieved_at;
        
        // Only show badges that are earned and haven't been shown
        return earnedAt && !shownIds.has(badgeId);
      });

      // Sort by earned_at date (most recent first)
      newBadges.sort((a, b) => {
        const dateA = new Date(a.earned_at || a.achieved_at || '').getTime();
        const dateB = new Date(b.earned_at || b.achieved_at || '').getTime();
        return dateB - dateA;
      });

      if (newBadges.length > 0) {
        const newestBadge = newBadges[0];
        const badgeInfo = newestBadge.badge || newestBadge;
        const badgeId = String(badgeInfo.id || newestBadge.id);
        
        setCurrentBadge(newestBadge);
        setIsVisible(true);
        await saveShownBadgeId(badgeId);
      }
    } catch (error) {
      // Silently fail for authentication errors (user not logged in)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('Session expired') && !errorMessage.includes('Authentication')) {
        console.error('Error checking for new badges:', error);
      }
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, userId, getShownBadgeIds, saveShownBadgeId]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // After closing, check if there are more new badges
    setTimeout(() => {
      checkForNewBadges();
    }, 500);
  }, [checkForNewBadges]);

  // Poll for new badges every 10 seconds when user is logged in
  useEffect(() => {
    if (!userId) {
      // Clear polling when logged out
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkForNewBadges();

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkForNewBadges();
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [userId, checkForNewBadges]);

  return (
    <BadgeContext.Provider value={{ checkForNewBadges, isChecking, clearShownBadges }}>
      {children}
      <BadgePopup
        visible={isVisible}
        badge={currentBadge}
        onClose={handleClose}
      />
    </BadgeContext.Provider>
  );
};

export const useBadge = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadge must be used within BadgeProvider');
  }
  return context;
};

