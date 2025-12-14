import { useColors } from '@/constants/colors';
import { Notification } from '@/api/notifications';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDateShort } from '@/i18n/utils';
import { useRouter } from 'expo-router';

interface NotificationPopupProps {
  visible: boolean;
  notification: Notification | null;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  visible,
  notification,
  onClose,
}) => {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);

  // Keep onClose ref up to date
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Auto-close after 3 seconds
      autoCloseTimeoutRef.current = setTimeout(() => {
        onCloseRef.current();
      }, 3000);
    } else {
      scaleAnim.setValue(0.8);
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    }

    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    };
  }, [visible, scaleAnim]);

  if (!visible || !notification) return null;

  const handlePress = () => {
    onClose();
    if (notification.event_details && notification.event) {
      router.push(`/events/${notification.event}`);
    } else {
      router.push('/notifications');
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 60,
      right: 16,
      left: 16,
      zIndex: 10000,
      pointerEvents: 'box-none',
    },
    modalView: {
      backgroundColor: colors.cb1,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.primary,
      borderLeftWidth: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    notificationIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      flex: 1,
    },
    notificationMessage: {
      fontSize: 15,
      color: colors.text,
      marginBottom: 6,
      lineHeight: 20,
    },
    notificationTimestamp: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    tapHint: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 4,
    },
  });

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={{ width: '100%' }}>
        <Animated.View
          style={[
            styles.modalView,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications" size={14} color="white" />
            </View>
            <Text style={styles.notificationTitle}>
              {notification.notification_type.replace(/_/g, ' ')}
            </Text>
          </View>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTimestamp}>
            {formatDateShort(notification.created_at)}
          </Text>
          {(notification.event_details || true) && (
            <Text style={styles.tapHint}>
              {t("notifications.tap_to_view", { defaultValue: "Tap to view" })}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationPopup;

