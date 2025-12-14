import { useColors } from "@/constants/colors";
import { Badge, getMyBadges } from "@/api/badges";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { formatDateShort } from "@/i18n/utils";

export default function BadgesScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        },
        headerBar: {
          height: "7%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: "4%",
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borders,
        },
        headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
        headerBarLogo: { width: 46, height: 46 },
        headerTitle: {
          fontSize: 22,
          fontWeight: "700",
          color: colors.primary,
        },
        headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
        iconButton: {
          width: 42,
          height: 42,
          borderRadius: 21,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        list: { padding: 14, paddingBottom: 32 },
        badgeCard: {
          backgroundColor: colors.cb1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: colors.borders,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 3,
        },
        badgeTopRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        badgeIconWrapper: {
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: colors.cb2,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.borders,
        },
        badgeIcon: { width: 36, height: 36, borderRadius: 18 },
        badgeTitle: {
          fontSize: 17,
          fontWeight: "700",
          color: colors.text,
        },
        badgeSubtitle: {
          fontSize: 13,
          color: colors.textSecondary,
          marginTop: 2,
        },
        badgeBottomRow: {
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 8,
        },
        statusBadge: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          marginLeft: "auto",
        },
        statusEarned: { backgroundColor: colors.primary },
        statusLocked: { backgroundColor: colors.sun },
        statusBadgeText: { color: "white", fontWeight: "600", fontSize: 12 },
        badgeDescription: {
          marginTop: 4,
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
        },
        progressSection: { marginTop: 12, gap: 6 },
        progressBar: {
          height: 10,
          backgroundColor: colors.cb2,
          borderRadius: 6,
          overflow: "hidden",
        },
        progressFill: {
          height: "100%",
          backgroundColor: colors.primary,
          borderRadius: 6,
        },
        progressText: {
          fontSize: 13,
          fontWeight: "500",
          color: colors.textSecondary,
          textAlign: "right",
        },
        emptyContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          gap: 12,
        },
        emptyTitle: {
          fontSize: 20,
          fontWeight: "700",
          color: colors.text,
        },
        emptyText: {
          fontSize: 15,
          textAlign: "center",
          color: colors.textSecondary,
          lineHeight: 22,
        },
        emptyButton: {
          marginTop: 4,
          backgroundColor: colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 18,
        },
        emptyButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
      }),
    [colors]
  );

  const fetchBadges = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setIsLoading(true);
        const data = await getMyBadges();
        setBadges(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching badges:", error);
        setBadges([]);
      } finally {
        if (showLoader) setIsLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchBadges(true);
  }, [fetchBadges]);

  useFocusEffect(
    useCallback(() => {
      fetchBadges(false);
    }, [fetchBadges])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBadges(false);
  }, [fetchBadges]);

  const renderBadgeCard = ({ item }: { item: Badge }) => {
    // Handle nested badge structure from API
    const badgeInfo = item.badge || item;
    const badgeId = badgeInfo.id || item.id;
    
    const imageUri =
      (typeof badgeInfo.icon === "string" && badgeInfo.icon.startsWith("http") && badgeInfo.icon) ||
      (typeof item.icon === "string" && item.icon.startsWith("http") && item.icon) ||
      (typeof item.icon_url === "string" && item.icon_url) ||
      (typeof item.image_url === "string" && item.image_url) ||
      (typeof item.image === "string" && item.image);
    
    const achievedAt = item.earned_at || item.achieved_at;
    const isEarned =
      typeof item.is_earned === "boolean"
        ? item.is_earned
        : !!achievedAt ||
          (typeof item.progress === "number" &&
            typeof item.target === "number" &&
            item.progress >= item.target);
    const progressValue =
      typeof item.progress === "number" ? item.progress : null;
    const progressTarget = typeof item.target === "number" ? item.target : null;
    const hasProgress = progressValue !== null && progressTarget !== null;
    const progressRatio =
      hasProgress && progressTarget
        ? Math.min(Math.max(progressValue / progressTarget, 0), 1)
        : 0;

    // Get badge name and description from nested structure
    const badgeName = 
      badgeInfo.name || 
      item.name || 
      (item as any).title || 
      (item as any).badge_name || 
      (item as any).badge_name_display ||
      t("badges.unnamed", { defaultValue: "Badge" });
    
    // Get description, with fallback based on badge code if description is empty
    let badgeDescription = 
      badgeInfo.description || 
      item.description || 
      (item as any).badge_description ||
      (item as any).desc ||
      null;
    
    // If description is empty, try to get a fallback based on code
    if (!badgeDescription && badgeInfo.code) {
      const codeDescriptions: Record<string, string> = {
        first_step: t("badges.descriptions.first_step", { defaultValue: "Log first waste" }),
        plastic_buster: t("badges.descriptions.plastic_buster", { defaultValue: "Recycle 10kg of plastic" }),
        sustainability_streak: t("badges.descriptions.sustainability_streak", { defaultValue: "Maintain a 14-day streak" }),
        zero_waste_legend: t("badges.descriptions.zero_waste_legend", { defaultValue: "Reach 5000 eco points" }),
      };
      badgeDescription = codeDescriptions[badgeInfo.code] || null;
    }

    return (
      <View style={styles.badgeCard}>
        <View style={styles.badgeTopRow}>
          <View style={styles.badgeIconWrapper}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.badgeIcon} />
            ) : (
              <Ionicons
                name={isEarned ? "trophy" : "trophy-outline"}
                size={28}
                color={colors.primary}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.badgeTitle}>
              {badgeName}
            </Text>
            {badgeDescription ? (
              <Text style={styles.badgeDescription}>
                {badgeDescription}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.statusBadge,
              isEarned ? styles.statusEarned : styles.statusLocked,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {isEarned
                ? t("badges.earned", { defaultValue: "Earned" })
                : t("badges.in_progress", { defaultValue: "In progress" })}
            </Text>
          </View>
        </View>

        {achievedAt ? (
          <View style={styles.badgeBottomRow}>
            <Text style={styles.badgeSubtitle}>
              {t("badges.earned_on", { defaultValue: "Earned on" })}{" "}
              {formatDateShort(achievedAt)}
            </Text>
          </View>
        ) : null}

        {hasProgress && progressValue !== null && progressTarget !== null ? (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {progressValue.toFixed(1)} / {progressTarget.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerBar}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t("badges.title", { defaultValue: "Your Badges" })}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => onRefresh()}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {!Array.isArray(badges) || badges.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="ribbon-outline" size={64} color={colors.primary} />
              <Text style={styles.emptyTitle}>
                {t("badges.empty_title", { defaultValue: "No badges yet" })}
              </Text>
              <Text style={styles.emptyText}>
                {t("badges.empty_message", {
                  defaultValue: "Keep completing goals to earn your first badge.",
                })}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={onRefresh}>
                <Text style={styles.emptyButtonText}>
                  {t("badges.refresh", { defaultValue: "Refresh" })}
                </Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={badges}
          renderItem={renderBadgeCard}
          keyExtractor={(item, index) => {
            const badgeId = (item.badge?.id || item.id);
            return badgeId != null ? String(badgeId) : `badge-${index}`;
          }}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

