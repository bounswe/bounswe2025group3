import { useColors } from "@/constants/colors";
import {
  getSubcategories,
  getWasteLogs,
  getWasteStats,
  Subcategory,
  WasteLog,
  WasteStatPeriod,
} from "@/api/waste";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { formatDateShort } from "@/i18n/utils";

type Period = "daily" | "weekly";

export default function StatsScreen() {
  const [stats, setStats] = useState<WasteStatPeriod[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [period, setPeriod] = useState<Period>("weekly");
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | "all">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        content: { flex: 1 },
        scrollContent: { padding: 12, paddingBottom: 32, gap: 16 },
        cardsRow: { flexDirection: "row", gap: 12 },
        statCard: {
          flex: 1,
          backgroundColor: colors.cb1,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.borders,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
        statValue: { fontSize: 24, fontWeight: "700", color: colors.primary },
        statLabel: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
        filtersBlock: {
          backgroundColor: colors.cb1,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.borders,
          padding: 12,
          gap: 10,
        },
        filtersRow: { flexDirection: "row", gap: 8 },
        filterButton: {
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 18,
          backgroundColor: colors.cb2,
          borderWidth: 1,
          borderColor: colors.borders,
        },
        filterButtonActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        filterText: { color: colors.textSecondary, fontWeight: "600" },
        filterTextActive: { color: "white" },
        chipList: { gap: 8 },
        chip: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.borders,
          backgroundColor: colors.cb2,
        },
        chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
        chipText: { color: colors.textSecondary, fontWeight: "500" },
        chipTextActive: { color: "white" },
        sectionHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 4,
          marginBottom: 6,
        },
        sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.primary },
        entryCard: {
          backgroundColor: colors.cb1,
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.borders,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
          elevation: 2,
          marginBottom: 10,
        },
        entryHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        },
        entryRange: { fontSize: 15, fontWeight: "600", color: colors.text },
        entryLabel: { fontSize: 13, color: colors.textSecondary },
        entryRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 6,
        },
        entryValue: { fontSize: 16, fontWeight: "700", color: colors.text },
        barBackground: {
          height: 8,
          backgroundColor: colors.cb2,
          borderRadius: 6,
          overflow: "hidden",
          marginTop: 10,
        },
        barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 6 },
        emptyState: {
          alignItems: "center",
          padding: 24,
          backgroundColor: colors.cb1,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.borders,
          gap: 10,
        },
        emptyText: { fontSize: 15, color: colors.textSecondary, textAlign: "center" },
      }),
    [colors]
  );

  const fetchFilters = useCallback(async () => {
    try {
      const data = await getSubcategories();
      setSubcategories(data || []);
    } catch (error) {
      console.error("Failed to load subcategories:", error);
      setSubcategories([]);
    }
  }, []);

  const fetchStats = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setIsLoading(true);
        const subcategoryParam =
          selectedSubcategory === "all" ? undefined : selectedSubcategory;
        const data = await getWasteStats(period, subcategoryParam);
        setStats(Array.isArray(data) ? data : []);
        const wasteLogs = await getWasteLogs();
        setLogs(Array.isArray(wasteLogs) ? wasteLogs : []);
      } catch (error) {
        console.error("Failed to load stats:", error);
        setStats([]);
        setLogs([]);
      } finally {
        if (showLoader) setIsLoading(false);
        setRefreshing(false);
      }
    },
    [period, selectedSubcategory]
  );

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchStats(true);
  }, [fetchStats]);

  useFocusEffect(
    useCallback(() => {
      if (!isInitialLoad.current) {
        fetchStats(false);
      } else {
        isInitialLoad.current = false;
      }
    }, [fetchStats])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats(false);
  }, [fetchStats]);

  const totalScore = useMemo(
    () => (Array.isArray(stats) ? stats : []).reduce((acc, item) => acc + (item.total_score || 0), 0),
    [stats]
  );
  const totalLogs = useMemo(
    () => (Array.isArray(stats) ? stats : []).reduce((acc, item) => acc + (item.total_log || 0), 0),
    [stats]
  );
  const maxScore = useMemo(() => {
    if (!Array.isArray(stats) || stats.length === 0) return 1;
    return Math.max(...stats.map((item) => item.total_score || 0), 1);
  }, [stats]);

  const chartMaxValue = useMemo(() => {
    if (!Array.isArray(stats) || stats.length === 0) return 1;
    return Math.max(
      ...stats.map((item) => Math.max(item.total_score || 0, item.total_log || 0)),
      1
    );
  }, [stats]);

  const bestPeriod = useMemo(() => {
    if (!Array.isArray(stats) || stats.length === 0) return null;
    return [...stats].sort((a, b) => b.total_score - a.total_score)[0];
  }, [stats]);

  const averageScore = useMemo(
    () => (Array.isArray(stats) && stats.length ? totalScore / stats.length : 0),
    [stats, totalScore]
  );

  const chartColors = useMemo(
    () => ["#4CAF50", "#2196F3", "#FFB300", "#9C27B0", "#26A69A", "#EF5350"],
    []
  );

  const categoryBreakdown = useMemo(() => {
    if (!logs || !Array.isArray(logs) || logs.length === 0) return [];
    const map: Record<string, number> = {};
    logs.forEach((log) => {
      const name = log.sub_category_name || t("stats.unknown_category", { defaultValue: "Other" });
      map[name] = (map[name] || 0) + Number(log.quantity || 0);
    });
    const entries = Object.entries(map).map(([name, value]) => ({ name, value }));
    const total = entries.reduce((acc, item) => acc + item.value, 0) || 1;
    return entries
      .sort((a, b) => b.value - a.value)
      .map((item, idx) => ({
        ...item,
        ratio: item.value / total,
        color: chartColors[idx % chartColors.length],
      }));
  }, [logs, t, chartColors]);

  const treeCount = Math.max(Math.floor(totalScore / 500), 0);

  const periodButtons: { key: Period; label: string }[] = [
    { key: "daily", label: t("stats.period_daily") },
    { key: "weekly", label: t("stats.period_weekly") },
  ];

  const subcategoryChips = useMemo(
    () => [
      { key: "all" as const, label: t("stats.subcategory_all") },
      ...(Array.isArray(subcategories) ? subcategories.map((sc) => ({ key: sc.id, label: sc.name })) : []),
    ],
    [subcategories, t]
  );

  const renderEntry = ({ item }: { item: WasteStatPeriod }) => {
    const ratio = Math.min(
      Math.max((item.total_score || 0) / (maxScore || 1), 0),
      1
    );
    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryRange}>
            {t("stats.range", {
              start: formatDateShort(item.start_date),
              end: formatDateShort(item.end_date),
            })}
          </Text>
          <Text style={styles.entryLabel}>
            {period === "daily" ? t("stats.daily_label") : t("stats.weekly_label")}
          </Text>
        </View>
        <View style={styles.entryRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MaterialCommunityIcons
              name="star-four-points-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.entryValue}>{item.total_score.toFixed(1)}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="list-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.entryValue}>{item.total_log}</Text>
          </View>
        </View>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
        </View>
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
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("stats.title")}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.cardsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="star-four-points-outline"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.statValue}>{totalScore.toFixed(1)}</Text>
            <Text style={styles.statLabel}>{t("stats.total_score")}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={28} color={colors.primary} />
            <Text style={styles.statValue}>{totalLogs}</Text>
            <Text style={styles.statLabel}>{t("stats.total_logs")}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="stats-chart" size={28} color={colors.primary} />
            <Text style={styles.statValue}>
              {averageScore.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>{t("stats.average_score")}</Text>
          </View>
        </View>

        {bestPeriod ? (
          <View style={styles.filtersBlock}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("stats.best_period")}</Text>
            </View>
            <Text style={styles.entryRange}>
              {t("stats.range", {
                start: formatDateShort(bestPeriod.start_date),
                end: formatDateShort(bestPeriod.end_date),
              })}
            </Text>
            <View style={styles.entryRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialCommunityIcons
                  name="star-four-points-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.entryValue}>{bestPeriod.total_score.toFixed(1)}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="list-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.entryValue}>{bestPeriod.total_log}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.filtersBlock}>
          <View style={styles.filtersRow}>
            {periodButtons.map((btn) => (
              <TouchableOpacity
                key={btn.key}
                style={[
                  styles.filterButton,
                  period === btn.key && styles.filterButtonActive,
                ]}
                onPress={() => setPeriod(btn.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    period === btn.key && styles.filterTextActive,
                  ]}
                >
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {subcategoryChips.map((chip) => {
              const isActive = selectedSubcategory === chip.key;
              return (
                <TouchableOpacity
                  key={chip.key.toString()}
                  style={[
                    styles.chip,
                    isActive && styles.chipActive,
                  ]}
                  onPress={() => setSelectedSubcategory(chip.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive && styles.chipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("stats.activity")}</Text>
        </View>

        {!Array.isArray(stats) || stats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.primary} />
            <Text style={styles.emptyText}>{t("stats.empty_title")}</Text>
            <Text style={styles.emptyText}>{t("stats.empty_message")}</Text>
          </View>
        ) : (
          <View style={[styles.filtersBlock, { gap: 14 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#4CAF50" }} />
                <Text style={styles.filterText}>{t("stats.points_label")}</Text>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#2196F3" }} />
                <Text style={styles.filterText}>{t("stats.logs_label")}</Text>
              </View>
              <Text style={styles.filterText}>{t("stats.latest_periods", { count: stats.length })}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
            >
              {stats.map((item, idx) => {
                const scoreHeight = Math.max((item.total_score / chartMaxValue) * 140, 4);
                const logHeight = Math.max((item.total_log / chartMaxValue) * 140, 4);
                return (
                  <View
                    key={`${item.start_date}-${idx}`}
                    style={{ alignItems: "center", width: 70 }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 160 }}>
                      <View
                        style={{
                          width: 18,
                          height: scoreHeight,
                          backgroundColor: "#4CAF50",
                          borderRadius: 6,
                        }}
                      />
                      <View
                        style={{
                          width: 18,
                          height: logHeight,
                          backgroundColor: "#2196F3",
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <Text style={{ color: colors.text, fontSize: 12, marginTop: 6, textAlign: "center" }}>
                      {formatDateShort(item.start_date)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <FlatList
              data={stats}
              renderItem={renderEntry}
              keyExtractor={(item, idx) => `${item.start_date}-${idx}`}
              scrollEnabled={false}
            />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("stats.breakdown_title")}</Text>
        </View>
        <View style={styles.filtersBlock}>
          {categoryBreakdown.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="pie-chart-outline" size={48} color={colors.primary} />
              <Text style={styles.emptyText}>{t("stats.breakdown_empty")}</Text>
            </View>
          ) : (
            categoryBreakdown.map((item, idx) => (
              <View key={item.name + idx} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>{item.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {item.value.toFixed(1)} ({Math.round(item.ratio * 100)}%)
                  </Text>
                </View>
                <View style={[styles.barBackground, { height: 10 }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${item.ratio * 100}%`, backgroundColor: item.color },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("stats.forest_title")}</Text>
        </View>
        <View style={styles.filtersBlock}>
          {treeCount > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {Array.from({ length: treeCount }).map((_, i) => (
                <Text key={i} style={{ fontSize: 24 }}>🌲</Text>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.primary} />
              <Text style={styles.emptyText}>{t("stats.forest_empty")}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

