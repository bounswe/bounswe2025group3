import ChallengeCardView from "@/components/challenges/ChallengeCard";
import {
  Challenge,
  ChallengeStatus,
  getChallengeStatus,
  getChallenges,
} from "@/api/challenges";
import { useColors } from "@/constants/colors";
import tokenManager from "@/services/tokenManager";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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

type FilterValue = "all" | ChallengeStatus;

interface WasteCategory {
  id: number;
  name: string;
}

interface WasteSubCategory {
  id: number;
  name: string;
  category: number;
}

const filterOptions: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All challenges" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

const extractResults = <T,>(payload: any): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload.results)) return payload.results as T[];
  return [];
};

export default function ChallengesScreen() {
  const colors = useColors();
  const router = useRouter();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryLabels, setCategoryLabels] = useState<Record<number, string>>({});
  const [subCategoryLabels, setSubCategoryLabels] = useState<Record<number, string>>({});

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        headerBar: {
          height: "7%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: "4%",
          paddingTop: 0,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borders,
        },
        headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
        headerLogo: { width: 48, height: 48 },
        headerTitle: { fontSize: 24, fontWeight: "600", color: colors.primary },
        headerSubtitle: { fontSize: 13, color: colors.textSecondary },
        listContainer: { paddingHorizontal: 16, paddingBottom: 32 },
        screenIntro: { paddingVertical: 20, gap: 6 },
        filterBar: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginVertical: 12,
        },
        filterChip: {
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.borders,
          backgroundColor: colors.background,
        },
        filterChipActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        filterText: { fontSize: 13, fontWeight: "500", color: colors.text },
        filterTextActive: { color: colors.background },
        helperText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
        errorBox: {
          backgroundColor: "#FFF3F3",
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          borderWidth: 1,
          borderColor: colors.error,
          marginBottom: 16,
        },
        errorText: { color: colors.error, flex: 1, fontSize: 14 },
        loaderContainer: { paddingVertical: 40, alignItems: "center" },
        emptyState: {
          paddingVertical: 64,
          alignItems: "center",
          gap: 12,
        },
        emptyIcon: { fontSize: 44 },
        emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
        emptyText: {
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 21,
          paddingHorizontal: 16,
        },
      }),
    [colors]
  );

  const getTargetLabel = useCallback(
    (challenge: Challenge): string => {
      if (challenge.target_subcategory && subCategoryLabels[challenge.target_subcategory]) {
        return subCategoryLabels[challenge.target_subcategory];
      }
      if (challenge.target_category && categoryLabels[challenge.target_category]) {
        return categoryLabels[challenge.target_category];
      }
      return "General impact";
    },
    [categoryLabels, subCategoryLabels]
  );

  const loadChallenges = useCallback(
    async (opts?: { refresh?: boolean }) => {
      if (opts?.refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [challengeData, categoriesResponse, subCategoriesResponse] = await Promise.all([
          getChallenges(),
          tokenManager.authenticatedFetch("/v1/waste/categories/"),
          tokenManager.authenticatedFetch("/v1/waste/subcategories/"),
        ]);

        let categoryMap: Record<number, string> = {};
        let subCategoryMap: Record<number, string> = {};

        if (categoriesResponse.ok) {
          const categoryPayload = await categoriesResponse.json();
          const categories = extractResults<WasteCategory>(categoryPayload);
          categoryMap = categories.reduce(
            (acc, category) => ({ ...acc, [category.id]: category.name }),
            {}
          );
        }

        if (subCategoriesResponse.ok) {
          const subCategoryPayload = await subCategoriesResponse.json();
          const subCategories = extractResults<WasteSubCategory>(subCategoryPayload);
          subCategoryMap = subCategories.reduce(
            (acc, subCategory) => ({ ...acc, [subCategory.id]: subCategory.name }),
            {}
          );
        }

        setCategoryLabels(categoryMap);
        setSubCategoryLabels(subCategoryMap);
        setChallenges(challengeData.results ?? []);
      } catch (fetchError) {
        console.error("Failed to fetch challenges:", fetchError);
        setError(
          fetchError instanceof Error ? fetchError.message : "Failed to load challenges."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [loadChallenges])
  );

  const orderedChallenges = useMemo(() => {
    const decorated = challenges.map((challenge) => ({
      challenge,
      status: getChallengeStatus(challenge),
    }));

    const filtered =
      selectedFilter === "all"
        ? decorated
        : decorated.filter((item) => item.status === selectedFilter);

    const statusOrder: Record<ChallengeStatus, number> = {
      active: 0,
      upcoming: 1,
      past: 2,
    };

    return [...filtered].sort((a, b) => {
      const statusDifference = statusOrder[a.status] - statusOrder[b.status];
      if (statusDifference !== 0) return statusDifference;

      const aStart = new Date(a.challenge.start_date).getTime();
      const bStart = new Date(b.challenge.start_date).getTime();
      return aStart - bStart;
    });
  }, [challenges, selectedFilter]);

  const onRefresh = useCallback(() => {
    loadChallenges({ refresh: true });
  }, [loadChallenges]);

  const renderChallenge = useCallback(
    ({ item }: { item: { challenge: Challenge; status: ChallengeStatus } }) => (
      <ChallengeCardView
        challenge={item.challenge}
        status={item.status}
        categoryName={getTargetLabel(item.challenge)}
        onPress={() =>
          router.push({
            pathname: "/challenges/[id]",
            params: { id: item.challenge.id.toString() },
          })
        }
        actionLabel="View details"
      />
    ),
    [router, getTargetLabel]
  );

  const listHeader = (
    <View style={styles.screenIntro}>
      <Text style={styles.headerTitle}>Take on eco challenges</Text>
      <Text style={styles.helperText}>
        Join themed challenges to earn points, compete with others, and build lasting habits.
      </Text>

      <View style={styles.filterBar}>
        {filterOptions.map((option) => {
          const isActive = selectedFilter === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                isActive ? styles.filterChipActive : undefined,
              ]}
              onPress={() => setSelectedFilter(option.value)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive ? styles.filterTextActive : undefined,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={22} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadChallenges()}>
            <Ionicons name="refresh" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      ) : null}

      {isLoading && !isRefreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerBar}>
        <View style={styles.headerContent}>
          <Image
            source={require("@/assets/images/reversed-icon.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>Challenges</Text>
            <Text style={styles.headerSubtitle}>Explore, join, and make an impact</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={orderedChallenges}
        keyExtractor={(item) => item.challenge.id.toString()}
        renderItem={renderChallenge}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌿</Text>
              <Text style={styles.emptyTitle}>No challenges yet</Text>
              <Text style={styles.emptyText}>
                Check back soon for new sustainability challenges curated by the community.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}
