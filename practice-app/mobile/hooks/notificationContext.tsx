import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUnreadNotifications, Notification } from '@/api/notifications';
import { getUserProfile } from '@/api/user';
import NotificationPopup from '@/components/ui/notification-popup';
import { useSession } from '@/hooks/authContext';

interface NotificationContextType {
  checkForNewNotifications: () => Promise<void>;
  isChecking: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  checkForNewNotifications: async () => {},
  isChecking: false,
});

const getShownNotificationsKey = (userId: number | null): string => {
  if (userId) {
    return `@shown_notification_ids_${userId}`;
  }
  return '@shown_notification_ids';
};

const getInitializedKey = (userId: number | null): string => {
  if (userId) {
    return `@notification_system_initialized_${userId}`;
  }
  return '@notification_system_initialized';
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
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
          console.error('Error fetching user profile for notification context:', error);
        }
      } else {
        setUserId(null);
        // Clear polling when logged out
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };
    fetchUserId();
  }, [session]);

  const getShownNotificationIds = useCallback(async (): Promise<Set<string>> => {
    if (!userId) return new Set<string>();
    try {
      const key = getShownNotificationsKey(userId);
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        return new Set(ids);
      }
    } catch (error) {
      console.error('Error loading shown notification IDs:', error);
    }
    return new Set<string>();
  }, [userId]);

  const saveShownNotificationId = useCallback(async (notificationId: string | number) => {
    if (!userId) return;
    try {
      const shownIds = await getShownNotificationIds();
      shownIds.add(String(notificationId));
      const key = getShownNotificationsKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(shownIds)));
    } catch (error) {
      console.error('Error saving shown notification ID:', error);
    }
  }, [getShownNotificationIds, userId]);

  const checkForNewNotifications = useCallback(async () => {
    if (isChecking || !userId) return;
    
    setIsChecking(true);
    try {
      const unreadNotifications = await getUnreadNotifications();
      if (!Array.isArray(unreadNotifications) || unreadNotifications.length === 0) {
        setIsChecking(false);
        return;
      }

      const shownIds = await getShownNotificationIds();
      const initializedKey = getInitializedKey(userId);
      const isInitialized = await AsyncStorage.getItem(initializedKey);
      
      // If this is the first time checking notifications (e.g., first app launch),
      // mark all existing unread notifications as "shown" to prevent showing old notifications as pop-ups
      if (!isInitialized) {
        const existingNotificationIds: string[] = [];
        unreadNotifications.forEach((notification) => {
          existingNotificationIds.push(String(notification.id));
        });
        
        if (existingNotificationIds.length > 0) {
          const key = getShownNotificationsKey(userId);
          await AsyncStorage.setItem(key, JSON.stringify(existingNotificationIds));
          await AsyncStorage.setItem(initializedKey, 'true');
        }
        setIsChecking(false);
        return; // Don't show any pop-ups on first initialization
      }
      
      // Find new notifications that haven't been shown
      const newNotifications = unreadNotifications.filter((notification) => {
        const notificationId = String(notification.id);
        return !shownIds.has(notificationId);
      });

      // Sort by created_at date (most recent first)
      newNotifications.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      if (newNotifications.length > 0) {
        const newestNotification = newNotifications[0];
        const notificationId = String(newestNotification.id);
        
        setCurrentNotification(newestNotification);
        setIsVisible(true);
        await saveShownNotificationId(notificationId);
      }
    } catch (error) {
      // Silently fail for authentication errors (user not logged in)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('Session expired') && 
          !errorMessage.includes('Authentication') && 
          !errorMessage.includes('No access token found')) {
        console.error('Error checking for new notifications:', error);
      }
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, userId, getShownNotificationIds, saveShownNotificationId]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // After closing, check if there are more new notifications
    setTimeout(() => {
      checkForNewNotifications();
    }, 500);
  }, [checkForNewNotifications]);

  // Poll for new notifications every 30 seconds when user is logged in
  useEffect(() => {
    if (!userId) return;

    // Initial check
    checkForNewNotifications();

    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkForNewNotifications();
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [userId, checkForNewNotifications]);

  return (
    <NotificationContext.Provider value={{ checkForNewNotifications, isChecking }}>
      {children}
      <NotificationPopup
        visible={isVisible}
        notification={currentNotification}
        onClose={handleClose}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

