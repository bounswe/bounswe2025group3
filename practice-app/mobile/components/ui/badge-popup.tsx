import { useColors } from '@/constants/colors';
import { Badge } from '@/api/badges';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDateShort } from '@/i18n/utils';

interface BadgePopupProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
}

const BadgePopup: React.FC<BadgePopupProps> = ({
  visible,
  badge,
  onClose,
}) => {
  const colors = useColors();
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Auto-close after 3.5 seconds (Steam-like behavior)
      autoCloseTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 3500);
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
      }
    };
  }, [visible, scaleAnim, onClose]);

  if (!visible || !badge) return null;

  // Handle nested badge structure
  const badgeInfo = badge.badge || badge;
  const badgeId = badgeInfo.id || badge.id;
  
  // Check for emoji icon first (single character emoji or short string)
  const emojiIcon = 
    (typeof badgeInfo.icon === "string" && badgeInfo.icon.length <= 2 && badgeInfo.icon) ||
    (typeof badge.icon === "string" && badge.icon.length <= 2 && badge.icon);
  
  // Then check for image URLs
  const imageUri = emojiIcon ? null :
    (typeof badgeInfo.icon === "string" && badgeInfo.icon.startsWith("http") && badgeInfo.icon) ||
    (typeof badge.icon === "string" && badge.icon.startsWith("http") && badge.icon) ||
    (typeof badge.icon_url === "string" && badge.icon_url) ||
    (typeof badge.image_url === "string" && badge.image_url) ||
    (typeof badge.image === "string" && badge.image);

  const badgeName = 
    badgeInfo.name || 
    badge.name || 
    t("badges.unnamed", { defaultValue: "Badge" });

  let badgeDescription = 
    badgeInfo.description || 
    badge.description || 
    null;

  if (!badgeDescription && badgeInfo.code) {
    const codeDescriptions: Record<string, string> = {
      first_step: t("badges.descriptions.first_step", { defaultValue: "Log first waste" }),
      plastic_buster: t("badges.descriptions.plastic_buster", { defaultValue: "Recycle 10kg of plastic" }),
      sustainability_streak: t("badges.descriptions.sustainability_streak", { defaultValue: "Maintain a 14-day streak" }),
      zero_waste_legend: t("badges.descriptions.zero_waste_legend", { defaultValue: "Reach 5000 eco points" }),
    };
    badgeDescription = codeDescriptions[badgeInfo.code] || null;
  }

  const achievedAt = badge.earned_at || badge.achieved_at;

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 10000,
    },
    modalView: {
      backgroundColor: colors.cb1,
      borderRadius: 20,
      width: '85%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    contentContainer: {
      padding: 24,
      alignItems: 'center',
      width: '100%',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    achievementText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.cb2,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.primary,
      marginBottom: 16,
    },
    badgeIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    badgeTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    badgeDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 22,
    },
    earnedDate: {
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        style={[
          styles.modalView,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Ionicons name="trophy" size={20} color={colors.primary} />
            <Text style={styles.achievementText}>
              {t("badges.unnamed", { defaultValue: "Badge" })}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            {emojiIcon ? (
              <Text style={{ fontSize: 48 }}>{emojiIcon}</Text>
            ) : imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.badgeIcon} />
            ) : (
              <Ionicons
                name="trophy"
                size={50}
                color={colors.primary}
              />
            )}
          </View>

          <Text style={styles.badgeTitle}>{badgeName}</Text>

          {badgeDescription && (
            <Text style={styles.badgeDescription}>{badgeDescription}</Text>
          )}

          {achievedAt && (
            <Text style={styles.earnedDate}>
              {formatDateShort(achievedAt)}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default BadgePopup;

