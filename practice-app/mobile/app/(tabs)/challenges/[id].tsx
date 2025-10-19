import {
  Challenge,
  ChallengeStatus,
  getChallengeById,
  getChallengeStatus,
  joinChallenge,
  leaveChallenge,
} from "@/api/challenges";
import { useColors } from "@/constants/colors";
import tokenManager from "@/services/tokenManager";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WasteCategory {
  id: number;
  name: string;
}

interface WasteSubCategory {
  id: number;
  name: string;
}

const extractResults = <T,>(payload: any): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload.results)) return payload.results as T[];
  return [];
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ChallengeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeId = Number(id);

  const colors = useColors();
  const router = useRouter();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<ChallengeStatus>("upcoming");
  const [targetLabel, setTargetLabel] = useState<string>("General impact");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        contentContainer: { padding: 16, paddingBottom: 48 },
        headerSpacer: { height: 12 },
        backButton: {
          backgroundColor: colors.background,
          borderRadius: 22,
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.borders,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        },
        card: {
          marginTop: 24,
          backgroundColor: colors.cb1,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.borders,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
          gap: 20,
        },
        titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 16 },
        titleText: { flex: 1, fontSize: 24, fontWeight: "700", color: colors.text },
        statusBadge: {
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 18,
        },
        statusText: { fontSize: 12, fontWeight: "700" },
        description: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
        infoSection: { gap: 12 },
        infoRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: colors.cb2,
          paddingHorizontal: 14,
        },
        infoText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
        infoHighlight: { fontSize: 15, fontWeight: "600", color: colors.text },
        statsGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
        statCard: {
          flex: 1,
          backgroundColor: colors.background,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.borders,
          alignItems: "flex-start",
          gap: 6,
        },
        statLabel: { fontSize: 12, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.6 },
        statValue: { fontSize: 18, fontWeight: "700", color: colors.text },
        actionSection: { gap: 12 },
        primaryButton: {
          backgroundColor: colors.primary,
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        },
        primaryButtonDisabled: {
          backgroundColor: colors.inactive_button,
        },
        primaryButtonText: {
          fontSize: 16,
          fontWeight: "600",
          color: colors.background,
        },
        primaryButtonTextDisabled: {
          color: colors.inactive_text,
        },
        secondaryButton: {
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          borderWidth: 1,
          borderColor: colors.error,
          backgroundColor: colors.background,
        },
        secondaryButtonText: {
          fontSize: 16,
          fontWeight: "600",
          color: colors.error,
        },
        helperNotice: {
          flexDirection: "row",
          gap: 10,
          borderRadius: 12,
          padding: 12,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.borders,
        },
        helperText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
        loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
        errorContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          gap: 12,
        },
        errorTitle: { fontSize: 18, fontWeight: "600", color: colors.error },
        errorMessage: { fontSize: 15, textAlign: "center", color: colors.textSecondary, lineHeight: 22 },
        retryButton: {
          marginTop: 8,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        retryText: { color: colors.primary, fontWeight: "600" },
      }),
    [colors]
  );

  const statusPalette = useMemo(
    () => ({
      active: { backgroundColor: colors.primary, textColor: colors.background },
      upcoming: { backgroundColor: colors.sun, textColor: colors.black },
      past: { backgroundColor: colors.error, textColor: colors.background },
    }),
    [colors]
  );

  const statusInfo = statusPalette[status] ?? statusPalette.active;

  const fetchChallengeDetails = useCallback(async () => {
    if (Number.isNaN(challengeId)) {
      setError("Challenge identifier is invalid.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [challengeData, categoriesResponse, subCategoriesResponse] = await Promise.all([
        getChallengeById(challengeId),
        tokenManager.authenticatedFetch("/v1/waste/categories/"),
        tokenManager.authenticatedFetch("/v1/waste/subcategories/"),
      ]);

      let categoryMap: Record<number, string> = {};
      let subCategoryMap: Record<number, string> = {};

      if (categoriesResponse.ok) {
        const categoryPayload = await categoriesResponse.json();
        categoryMap = extractResults<WasteCategory>(categoryPayload).reduce(
          (acc, category) => ({ ...acc, [category.id]: category.name }),
          {}
        );
      }

      if (subCategoriesResponse.ok) {
        const subCategoryPayload = await subCategoriesResponse.json();
        subCategoryMap = extractResults<WasteSubCategory>(subCategoryPayload).reduce(
          (acc, subCategory) => ({ ...acc, [subCategory.id]: subCategory.name }),
          {}
        );
      }

      setChallenge(challengeData);
      setStatus(getChallengeStatus(challengeData));

      if (challengeData.target_subcategory && subCategoryMap[challengeData.target_subcategory]) {
        setTargetLabel(subCategoryMap[challengeData.target_subcategory]);
      } else if (challengeData.target_category && categoryMap[challengeData.target_category]) {
        setTargetLabel(categoryMap[challengeData.target_category]);
      } else {
        setTargetLabel("General impact");
      }
    } catch (fetchError) {
      console.error("Failed to load challenge:", fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load challenge.");
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    fetchChallengeDetails();
  }, [fetchChallengeDetails]);

  const handleJoin = useCallback(async () => {
    if (!challenge) return;
    setIsActionLoading(true);
    try {
      await joinChallenge(challenge.id);
      setIsParticipating(true);
      setChallenge((prev) =>
        prev
          ? { ...prev, participants_count: (prev.participants_count ?? 0) + 1 }
          : prev
      );
      Alert.alert("Joined challenge", "You're officially part of this challenge. Good luck!");
    } catch (joinError) {
      const message =
        joinError instanceof Error ? joinError.message : "Could not join the challenge.";
      Alert.alert("Join failed", message);
    } finally {
      setIsActionLoading(false);
    }
  }, [challenge]);

  const handleLeave = useCallback(async () => {
    if (!challenge) return;
    Alert.alert(
      "Leave challenge",
      "Are you sure you want to leave this challenge?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setIsActionLoading(true);
            try {
              await leaveChallenge(challenge.id);
              setIsParticipating(false);
              setChallenge((prev) =>
                prev
                  ? {
                      ...prev,
                      participants_count: Math.max((prev.participants_count ?? 1) - 1, 0),
                    }
                  : prev
              );
              Alert.alert("Left challenge", "You have exited this challenge.");
            } catch (leaveError) {
              const message =
                leaveError instanceof Error
                  ? leaveError.message
                  : "Could not leave the challenge.";
              Alert.alert("Leave failed", message);
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [challenge]);

  const goalValue = Number(challenge?.goal_quantity ?? 0);
  const formattedGoal = Number.isFinite(goalValue)
    ? goalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : challenge?.goal_quantity ?? "";

  const isJoinDisabled =
    isParticipating || status !== "upcoming" || isActionLoading || !challenge;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={42} color={colors.error} />
            <Text style={styles.errorTitle}>Unable to load challenge</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchChallengeDetails}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : challenge ? (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{challenge.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusInfo.backgroundColor },
                ]}
              >
                <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{challenge.description}</Text>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="leaf-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>Focus area</Text>
                <Text style={styles.infoHighlight}>{targetLabel}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>Schedule</Text>
                <Text style={styles.infoHighlight}>
                  {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>Entry type</Text>
                <Text style={styles.infoHighlight}>
                  {challenge.entry_type.charAt(0).toUpperCase() + challenge.entry_type.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Goal target</Text>
                <Text style={styles.statValue}>
                  {formattedGoal} {challenge.unit ?? ""}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Participants</Text>
                <Text style={styles.statValue}>{challenge.participants_count ?? 0}</Text>
              </View>
            </View>

            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isJoinDisabled ? styles.primaryButtonDisabled : undefined,
                ]}
                disabled={isJoinDisabled}
                onPress={handleJoin}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="trophy-award"
                  size={20}
                  color={isJoinDisabled ? colors.inactive_text : colors.background}
                />
                <Text
                  style={[
                    styles.primaryButtonText,
                    isJoinDisabled ? styles.primaryButtonTextDisabled : undefined,
                  ]}
                >
                  {isParticipating ? "You're in" : "Join challenge"}
                </Text>
              </TouchableOpacity>

              {isParticipating ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleLeave}
                  disabled={isActionLoading}
                >
                  <Ionicons name="exit-outline" size={20} color={colors.error} />
                  <Text style={styles.secondaryButtonText}>Leave challenge</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.helperNotice}>
                <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                <Text style={styles.helperText}>
                  {status === "upcoming"
                    ? "Join now to secure your spot. We'll notify you when the challenge begins."
                    : status === "active"
                      ? "This challenge has already started. Joining opens again in future editions."
                      : "Challenge has concluded. Keep an eye out for new opportunities soon."}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
