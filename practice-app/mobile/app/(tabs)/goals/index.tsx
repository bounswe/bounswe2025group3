import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router";
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { getGoals } from '@/api/functions';

interface SubCategory {
  id: number;
  name: string;
  category: number;
  unit: string;
  score_per_unit: string;
}

interface Goal {
  id: number;
  category: SubCategory;
  timeframe: 'daily' | 'weekly' | 'monthly';
  target: number;
  progress: number;
  is_complete: boolean;
  created_at: string;
  start_date: string;
  status: string;
}

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
    filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, backgroundColor: colors.cb2, borderWidth: 1, borderColor: colors.borders },
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
    if (goal.is_complete) return { text: 'Completed' as const, style: styles.statusComplete };
    if (today < startDate) return { text: 'Not Started' as const, style: styles.statusNotStarted };
    if (today >= endDate) return { text: 'Failed' as const, style: styles.statusEnded };
    return { text: 'In Progress' as const, style: styles.statusInProgress };
  }, [styles]);

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
    return goals.filter(goal => {
      const statusInfo = getGoalStatusInfo(goal);
      return statusInfo.text === activeFilter;
    });
  }, [goals, activeFilter, getGoalStatusInfo]);

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
              {item.timeframe?.charAt(0).toUpperCase() + item.timeframe?.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <View style={styles.dateInfo}>
            <Ionicons name="play-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              Start: {new Date(item.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Ionicons name="stop-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              End: {endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
              ]}>{filter}</Text>
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
          <Text style={styles.headerTitle}>Your Goals</Text>
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
            <Text style={styles.emptyTitle}>No Goals Found</Text>
            <Text style={styles.emptyText}>You haven't set any sustainability goals yet. Let's create one!</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/goals/add")}>
              <Text style={styles.emptyButtonText}>Create Your First Goal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : filteredGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Matching Goals</Text>
          <Text style={styles.emptyText}>
            There are no goals that match the "{activeFilter}" filter.
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