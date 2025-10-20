import { Challenge, ChallengeStatus } from "@/api/challenges";
import { useColors } from "@/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChallengeCardProps {
  challenge: Challenge;
  status: ChallengeStatus;
  categoryName?: string;
  onPress?: () => void;
  onActionPress?: () => void;
  actionLabel?: string;
  isActionDisabled?: boolean;
  isParticipating?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  status,
  categoryName,
  onPress,
  onActionPress,
  actionLabel = "View details",
  isActionDisabled = false,
  isParticipating = false,
}) => {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.cb1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.borders,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
        title: {
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          flex: 1,
          marginRight: 12,
        },
        statusBadge: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
        },
        statusText: {
          fontSize: 12,
          fontWeight: "600",
        },
        metaRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        },
        metaItem: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: colors.cb2,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 12,
        },
        metaText: {
          fontSize: 13,
          color: colors.textSecondary,
        },
        description: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
          marginBottom: 16,
        },
        statsRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        },
        statItem: {
          flex: 1,
          alignItems: "center",
        },
        statLabel: {
          fontSize: 12,
          color: colors.textSecondary,
          marginBottom: 4,
        },
        statValue: {
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
        },
        actionButton: {
          marginTop: "auto",
          backgroundColor: isActionDisabled ? colors.inactive_button : colors.primary,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
        },
        actionText: {
          fontSize: 15,
          fontWeight: "600",
          color: isActionDisabled ? colors.inactive_text : colors.background,
        },
        participationNotice: {
          padding: 12,
          borderRadius: 12,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.primary,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        },
        participationText: {
          fontSize: 13,
          fontWeight: "500",
          color: colors.primary,
          flex: 1,
        },
      }),
    [colors, isActionDisabled]
  );

  const statusConfig = useMemo(
    () => ({
      active: { label: "Active", background: colors.primary, text: colors.background },
      upcoming: { label: "Upcoming", background: colors.sun, text: colors.black },
      past: { label: "Past", background: colors.error, text: colors.background },
    }),
    [colors]
  );

  const statusInfo = statusConfig[status];
  const startDate = new Date(challenge.start_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const endDate = new Date(challenge.end_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const goalValue = Number(challenge.goal_quantity);
  const formattedGoal = Number.isFinite(goalValue)
    ? goalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : challenge.goal_quantity;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{challenge.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.background }]}>
          <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {categoryName ? (
          <View style={styles.metaItem}>
            <Ionicons name="leaf" size={16} color={colors.primary} />
            <Text style={styles.metaText}>{categoryName}</Text>
          </View>
        ) : null}

        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          <Text style={styles.metaText}>
            {challenge.entry_type.charAt(0).toUpperCase() + challenge.entry_type.slice(1)} entry
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={styles.metaText}>
            {startDate} - {endDate}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {challenge.description.length > 160
          ? `${challenge.description.substring(0, 157)}...`
          : challenge.description}
      </Text>

      {isParticipating ? (
        <View style={styles.participationNotice}>
          <MaterialCommunityIcons name="check-decagram" size={20} color={colors.primary} />
          <Text style={styles.participationText}>You are currently enrolled in this challenge.</Text>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Goal</Text>
          <Text style={styles.statValue}>
            {formattedGoal} {challenge.unit ?? ""}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Participants</Text>
          <Text style={styles.statValue}>{challenge.participants_count ?? 0}</Text>
        </View>
      </View>

      <TouchableOpacity
        disabled={isActionDisabled}
        style={styles.actionButton}
        onPress={onActionPress ?? onPress}
        activeOpacity={0.85}
      >
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>

      {onPress && onActionPress && onActionPress !== onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontWeight: "600", textAlign: "center" }}>
            View challenge details
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default ChallengeCard;
