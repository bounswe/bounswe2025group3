import tokenManager from "@/services/tokenManager";
import { Fontisto, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";


interface UserScore {
    user_id: number;
    total_score: number;
}

interface WasteLog {
    id: number;
    sub_category_name: string;
    quantity: string;
    date_logged: string;
    score: number;
}

interface Goal {
    id: number;
    category: {
        name: string;
    };
    goal_type: 'reduction' | 'recycling';
    timeframe: 'daily' | 'weekly' | 'monthly';
    target: number;
    progress: number;
    is_complete: boolean;
    created_at: string;
    start_date: string;
    end_date: string;
    status: string;
}

export default function HomeScreen() {
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [recentLogs, setRecentLogs] = useState<WasteLog[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const router = useRouter();
  const colors = useColors();


  const fetchData = async() => {
    try {
      const scoreResponse = await tokenManager.authenticatedFetch("/v1/waste/scores/me/");
      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        setUserScore(scoreData);
      }
      
      // Fetch recent waste logs
      const logsResponse = await tokenManager.authenticatedFetch("/v1/waste/logs");
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setRecentLogs(logsData.results.slice(0, 5)); // Get only 5 most recent logs
      }

      // Fetch active goals
      const goalsResponse = await tokenManager.authenticatedFetch("/v1/goals/goals/");
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        // Filter active goals and sort by end date
        const active = goalsData.results
          .filter((goal: Goal) => !goal.is_complete)
          .sort((a: Goal, b: Goal) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        setActiveGoals(active.slice(0, 3)); // Show top 3 active goals
      } 
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: { height: "7%", paddingHorizontal: "4%", paddingTop: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
    headerBarLogo: { width: 52, height:52},
    content: { flex: 1},
    scrollContent: { paddingBottom: "1%" },
    statsCard: { margin: "2%", paddingHorizontal: "5%", paddingVertical: "4%", backgroundColor: colors.cb1, borderRadius: 16},
    statsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    statsTitle: { fontSize: 20, fontWeight: '700', marginLeft: 12, color: colors.primary },
    scoreContainer: { alignItems: 'center', marginBottom: "3%", paddingVertical: 6 },
    scoreValueContainer: { padding: 16, minWidth: 120, minHeight: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: colors.cb1 },
    scoreValue: { fontSize: 32, fontWeight: '700', color: colors.primary, textAlign: 'center', lineHeight: 36 },
    scoreLabel: { fontSize: 16, color: "000000", marginTop: 8, fontWeight: '500' },
    viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: colors.primary, borderRadius: 12 },
    viewAllText: { color: colors.background, fontSize: 16, fontWeight: '600', marginRight: 8 },
    goalsCard: { margin: "2%", marginTop: "5%", paddingHorizontal: 20, paddingVertical: 15, backgroundColor: colors.cb1, borderRadius: 16 },
    goalsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    goalsTitle: { fontSize: 18, fontWeight: '600', marginLeft: 8, color: colors.primary, flex: 1 },
    activityCard: { margin: "2%", marginTop: "5%", paddingHorizontal: 20, paddingVertical: 15, backgroundColor: colors.cb1, borderRadius: 16 },
    activityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    activityTitle: { fontSize: 18, fontWeight: '600', marginLeft: 8, color: colors.primary, flex: 1 },
    seeAllText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
    activityList: { gap: 12 },
    activityItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.cb2, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.borders },
    activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    activityContent: { flex: 1 },
    activityItemTitle: { fontSize: 16, fontWeight: '500', color: colors.text },
    activitySubtitle: { fontSize: 14, color: colors.textSecondary },
    activityScore: { backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    scoreText: { color: colors.primary, fontWeight: '600' },
    emptyState: { alignItems: 'center', padding: 32, backgroundColor: colors.cb2, borderRadius: 12, borderWidth: 1, borderColor: colors.borders },
    emptyStateText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginVertical: 16 },
    addButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    addButtonText: { color: colors.background, fontSize: 16, fontWeight: '500' },
    goalsList: { gap: 12 },
    goalItem: { backgroundColor: colors.cb2, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.borders },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    goalTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    goalType: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
    goalTypeText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
    progressContainer: { marginVertical: 12 },
    progressBar: { height: 8, backgroundColor: colors.borders, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
    progressText: { fontSize: 14, color: colors.textSecondary, textAlign: 'right' },
    goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    deadlineContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    deadlineText: { fontSize: 12, color: colors.textSecondary },
    timeframeText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  });

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <View style={styles.headerBar}>
        <Image 
          source={require('@/assets/images/reversed-icon.png')} 
          style={styles.headerBarLogo} 
          resizeMode="contain"
        />
        <TouchableOpacity style={{marginLeft: "auto"}} onPress={() => router.push('/menu_drawer')}>
          <Fontisto name="nav-icon-grid-a" size={24} style={{paddingRight: "2%"}} color={colors.primary} />
        </TouchableOpacity>
      </View>
  
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
            <Text style={styles.statsTitle}>Your Eco Score 🌟</Text>
          </View>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreValueContainer}>
              <Text style={styles.scoreValue}>
                {userScore?.total_score ? Number(userScore.total_score).toFixed(1) : '0.0'}
              </Text>
            </View>
            <Text style={styles.scoreLabel}>Environmental Impact Points</Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/waste')}
          >
            <Text style={styles.viewAllText}>View Waste Log</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
  
        <View style={styles.goalsCard}>
          <View style={styles.goalsHeader}>
            <Ionicons name="flag" size={24} color={colors.primary} />
            <Text style={styles.goalsTitle}>Active Goals</Text>
            <TouchableOpacity onPress={() => router.push('/goals')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
  
          {activeGoals.length > 0 ? (
            <View style={styles.goalsList}>
              {activeGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={styles.goalItem}
                  onPress={() => router.push({
                    pathname: "/goals/[id]",
                    params: { id: goal.id }
                  })}
                >
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal.category.name}</Text>
                    <View style={styles.goalType}>
                      <Ionicons name="leaf" size={16} color={colors.primary} />
                      <Text style={styles.goalTypeText}>Goal</Text>
                    </View>
                  </View>
  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(goal.progress / goal.target) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {goal.progress.toFixed(1)} / {goal.target.toFixed(1)} kg
                    </Text>
                  </View>
  
                  <View style={styles.goalFooter}>
                    <View style={styles.deadlineContainer}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.deadlineText}>
                        Due: {new Date(goal.end_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <Text style={styles.timeframeText}>
                      {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color={colors.primary} />
              <Text style={styles.emptyStateText}>
                No active goals. Set your first sustainability goal!
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/goals/add')}
              >
                <Text style={styles.addButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
  
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/waste')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
  
          {recentLogs.length > 0 ? (
            <View style={styles.activityList}>
              {recentLogs.map((log) => (
                <View key={log.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="leaf-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityItemTitle}>
                      {log.sub_category_name}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {new Date(log.date_logged).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View style={styles.activityScore}>
                    <Text style={styles.scoreText}>+{log.score.toFixed(1)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.primary} />
              <Text style={styles.emptyStateText}>
                No recent waste logs. Start tracking your waste!
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/waste/add')}
              >
                <Text style={styles.addButtonText}>Add Waste Log</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <StatusBar style="auto"/>
    </SafeAreaView>
  );
}
