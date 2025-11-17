import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router";
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { getGoals, Goal } from '@/api/goals';
import { useTranslation } from 'react-i18next';

type FilterStatus = 'All' | 'In Progress' | 'Completed' | 'Failed' | 'Not Started';

const calculateEndDate = (start: Date, time: 'daily' | 'weekly' | 'monthly'): Date => {
  const end = new Date(start);
  switch (time) {
    case 'daily': end.setDate(end.getDate() + 1); break;
    case 'weekly': end.setDate(end.getDate() + 7); break;
    case 'monthly': end.setMonth(end.getMonth() + 1); break;
  }
  return end;
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');

  const router = useRouter();
  const colors = useColors();
  const isInitialLoad = useRef(true);
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    headerBar: { height: "7%", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: "4%", paddingTop: 0, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerBarLogo: { width: 52, height: 52 },
    headerTitle: { fontSize: 24, fontWeight: '600', color: colors.primary, marginLeft: "5%" },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    addButton: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2 },
    iconButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.primary },
    list: { padding: 10, paddingBottom: 40 },
    goalItem: { backgroundColor: colors.cb1, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: colors.borders },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    goalTitle: { fontSize: 18, fontWeight: '600', color: colors.text, flex: 1 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginLeft: 8 },
    statusComplete: { backgroundColor: colors.primary },
    statusInProgress: { backgroundColor: colors.sun },
    statusNotStarted: { backgroundColor: '#17a2b8' },
    statusEnded: { backgroundColor: colors.error },
    statusText: { fontSize: 12, fontWeight: '500', color: 'white' },
    goalDetails: { flexDirection: 'row', gap: 20, marginBottom: 16, alignItems: 'center' },
    goalInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    goalInfoText: { fontSize: 14, color: colors.textSecondary },
    dateContainer: { borderTopWidth: 1, borderTopColor: colors.borders, paddingTop: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 13, color: colors.textSecondary },
    progressContainer: { gap: 8 },
    progressBar: { height: 10, backgroundColor: colors.cb2, borderRadius: 5, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
    progressText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, textAlign: 'right' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    emptyText: { fontSize: 16, textAlign: 'center', color: colors.textSecondary, lineHeight: 24 },
    emptyButton: { marginTop: 16, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, elevation: 2 },
    emptyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    filterContainer: { paddingVertical: 10, paddingHorizontal: 10, backgroundColor: colors.background },
    filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary },
    activeFilterButton: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterButtonText: { color: colors.textSecondary, fontWeight: '500' },
    activeFilterButtonText: { color: 'white' },
  });

  const getGoalStatusInfo = useCallback((goal: Goal) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(goal.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = calculateEndDate(new Date(goal.start_date), goal.timeframe);
    if (goal.is_complete) return { text: t("goals.completed"), style: styles.statusComplete };
    if (today < startDate) return { text: t("goals.not_started"), style: styles.statusNotStarted };
    if (today >= endDate) return { text: t("goals.failed"), style: styles.statusEnded };
    return { text: t("goals.in_progress"), style: styles.statusInProgress };
  }, [styles, t]);

  const fetchGoals = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const goalsData = await getGoals();
      setGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      if (showLoader) setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGoals(false);
  }, []);

  useEffect(() => {
    fetchGoals(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isInitialLoad.current) {
        fetchGoals(false);
      } else {
        isInitialLoad.current = false;
      }
    }, [])
  );
  
  const filteredGoals = useMemo(() => {
    if (activeFilter === 'All') {
      return goals;
    }
    const statusMap: Record<FilterStatus, string> = {
      'All': '',
      'In Progress': t("goals.in_progress"),
      'Completed': t("goals.completed"),
      'Failed': t("goals.failed"),
      'Not Started': t("goals.not_started")
    };
    return goals.filter(goal => {
      const statusInfo = getGoalStatusInfo(goal);
      return statusInfo.text === statusMap[activeFilter];
    });
  }, [goals, activeFilter, getGoalStatusInfo, t]);

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const endDate = calculateEndDate(new Date(item.start_date), item.timeframe);
    const statusInfo = getGoalStatusInfo(item);
    return (
      <TouchableOpacity style={styles.goalItem} onPress={() => router.push({ pathname: "/goals/[id]", params: { id: item.id } })}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{item.category.name}</Text>
          <View style={[styles.statusBadge, statusInfo.style]}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>
        <View style={styles.goalDetails}>
          <View style={styles.goalInfo}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.goalInfoText}>
              {t(`goals.${item.timeframe}`)}
            </Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <View style={styles.dateInfo}>
            <Ionicons name="play-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              {t("goals.start")} {new Date(item.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Ionicons name="stop-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              {t("goals.end")} {endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((item.progress / item.target) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {item.progress.toFixed(1)} / {item.target.toFixed(1)} {item.category.unit}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterBar = () => {
    const filters: FilterStatus[] = ['All', 'In Progress', 'Completed', 'Failed', 'Not Started'];
    const filterLabels: Record<FilterStatus, string> = {
      'All': t("goals.all"),
      'In Progress': t("goals.in_progress"),
      'Completed': t("goals.completed"),
      'Failed': t("goals.failed"),
      'Not Started': t("goals.not_started")
    };
    return (
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter && styles.activeFilterButtonText,
              ]}>{filterLabels[filter]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          <Image source={require('@/assets/images/reversed-icon.png')} style={styles.headerBarLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>{t("goals.your_goals")}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push({ pathname: "/goals/templates" })}>
            <Ionicons name="list-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/goals/add")}>
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {renderFilterBar()}
      {goals.length === 0 ? (
        <ScrollView 
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={64} color={colors.primary} />
            <Text style={styles.emptyTitle}>{t("goals.no_goals_found")}</Text>
            <Text style={styles.emptyText}>{t("goals.no_goals_message")}</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/goals/add")}>
              <Text style={styles.emptyButtonText}>{t("goals.create_first_goal")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : filteredGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>{t("goals.no_matching_goals")}</Text>
          <Text style={styles.emptyText}>
            {t("goals.no_matching_goals_message").replace("{filter}", activeFilter === 'All' ? t("goals.all") : activeFilter === 'In Progress' ? t("goals.in_progress") : activeFilter === 'Completed' ? t("goals.completed") : activeFilter === 'Failed' ? t("goals.failed") : t("goals.not_started"))}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGoals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}