import { useColors } from "@/constants/colors";
import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
  NotificationListResponse,
} from "@/api/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { formatDateShort } from "@/i18n/utils";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<NotificationListResponse | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const isInitialLoad = useRef(true);

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
        headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
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
        headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
        markAllButton: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          backgroundColor: colors.primary,
        },
        markAllButtonText: { color: "white", fontSize: 12, fontWeight: "600" },
        filterButton: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          backgroundColor: showUnreadOnly ? colors.primary : colors.cb1,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        filterButtonText: { 
          color: showUnreadOnly ? "white" : colors.primary, 
          fontSize: 12, 
          fontWeight: "600" 
        },
        list: { padding: 14, paddingBottom: 32 },
        notificationItem: {
          backgroundColor: colors.cb1,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borders,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
          elevation: 2,
        },
        notificationItemUnread: {
          backgroundColor: colors.cb1,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        },
        notificationHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        },
        notificationType: {
          fontSize: 14,
          fontWeight: "600",
          color: colors.text,
        },
        unreadDot: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: colors.primary,
        },
        notificationMessage: {
          fontSize: 15,
          color: colors.text,
          marginBottom: 8,
          lineHeight: 20,
        },
        notificationTimestamp: {
          fontSize: 12,
          color: colors.textSecondary,
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
      }),
    [colors, showUnreadOnly]
  );

  const fetchNotifications = useCallback(
    async (page: number = 1, loadMore: boolean = false) => {
      try {
        if (loadMore) {
          setLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const response = await getNotifications(page);
        setNotifications((prev) =>
          page === 1 ? response.results : [...prev, ...response.results]
        );
        setPagination(response);
        
        const unread = response.results.filter((n) => !n.is_read).length;
        if (page === 1) {
          setUnreadCount(unread);
        } else {
          setUnreadCount((prev) => prev + unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      if (!isInitialLoad.current) {
        fetchNotifications(1);
      } else {
        isInitialLoad.current = false;
      }
    }, [fetchNotifications])
  );

  // Poll for new notifications every 30 seconds (like web site)
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const unreadNotifications = await getUnreadNotifications();
        if (unreadNotifications.length > 0) {
          // Check if we have new notifications that aren't in our current list
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newNotifications = unreadNotifications.filter(n => !existingIds.has(n.id));
            
            if (newNotifications.length > 0) {
              // Add new notifications to the top of the list
              return [...newNotifications, ...prev];
            }
            return prev;
          });
          
          // Update unread count separately
          setUnreadCount(prev => {
            const currentUnread = unreadNotifications.length;
            return currentUnread > prev ? currentUnread : prev;
          });
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    };

    // Initial poll
    pollNotifications();

    // Poll every 30 seconds
    const intervalId = setInterval(pollNotifications, 30000);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array - only run once on mount

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(1);
  }, [fetchNotifications]);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const unreadNotifications = await getUnreadNotifications();
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
      setPagination(null); // No pagination for unread only
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (showUnreadOnly) {
      fetchUnreadNotifications();
    } else {
      fetchNotifications(1);
    }
  }, [showUnreadOnly, fetchUnreadNotifications, fetchNotifications]);

  const handleLoadMore = () => {
    if (pagination?.next && !loadingMore) {
      const nextPage = pagination.count > 0 ? Math.floor(notifications.length / 20) + 1 : 1;
      fetchNotifications(nextPage, true);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleClearAll = () => {
    if (notifications.length === 0) {
      return;
    }
    
    Alert.alert(
      t("notifications.clear_all_title", { defaultValue: "Clear All Notifications" }),
      t("notifications.clear_all_message", { defaultValue: "Are you sure you want to clear all notifications? This will mark them all as read." }),
      [
        {
          text: t("common.cancel", { defaultValue: "Cancel" }),
          style: "cancel",
        },
        {
          text: t("common.clear", { defaultValue: "Clear" }),
          style: "destructive",
          onPress: async () => {
            await handleMarkAllRead();
          },
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const handlePress = () => {
      if (!item.is_read) {
        handleMarkAsRead(item.id);
      }
      if (item.event_details) {
        router.push(`/events/${item.event}`);
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.is_read && styles.notificationItemUnread,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationType}>
            {item.notification_type.replace(/_/g, " ")}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTimestamp}>
          {formatDateShort(item.created_at)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading && notifications.length === 0) {
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
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => {
            setShowUnreadOnly(!showUnreadOnly);
            if (!showUnreadOnly) {
              fetchUnreadNotifications();
            } else {
              fetchNotifications(1);
            }
          }}>
            <Text style={styles.filterButtonText}>
              {showUnreadOnly ? t("notifications.show_all", { defaultValue: "All" }) : t("notifications.unread_only", { defaultValue: "Unread" })}
            </Text>
          </TouchableOpacity>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
              <Text style={styles.markAllButtonText}>
                {t("notifications.mark_all_read", { count: unreadCount })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!Array.isArray(notifications) || notifications.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={64} color={colors.primary} />
              <Text style={styles.emptyTitle}>{t("notifications.empty_title")}</Text>
              <Text style={styles.emptyText}>{t("notifications.empty_message")}</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={showUnreadOnly ? notifications.filter(n => !n.is_read) : notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item, index) =>
            item.id != null ? String(item.id) : `notification-${index}`
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          onEndReached={!showUnreadOnly ? handleLoadMore : undefined}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

