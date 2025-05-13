import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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

interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface Goal {
  id: number;
  category: Category;
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    try {
      // Fetch user score
      const scoreResponse = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.MY_SCORE);
      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        setUserScore(scoreData);
      }

      // Fetch recent waste logs
      const logsResponse = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOGS);
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setRecentLogs(logsData.results.slice(0, 5)); // Get only 5 most recent logs
      }

      // Fetch active goals
      const goalsResponse = await TokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.LIST);
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
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeText}>Dashboard</ThemedText>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Ionicons name="leaf" size={24} color="#2E7D32" />
            <ThemedText style={styles.statsTitle}>Your Impact Score</ThemedText>
          </View>
          <View style={styles.scoreContainer}>
            <ThemedText style={styles.scoreValue}>
              {userScore?.total_score?.toFixed(1) || '0.0'}
            </ThemedText>
            <ThemedText style={styles.scoreLabel}>Environmental Impact Points</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/waste')}
          >
            <ThemedText style={styles.viewAllText}>View Waste Log</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Active Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Active Goals</ThemedText>
            <TouchableOpacity onPress={() => router.push('/goals')}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
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
                    <ThemedText style={styles.goalTitle}>{goal.category.name}</ThemedText>
                    <View style={styles.goalType}>
                      <Ionicons
                        name={goal.goal_type === 'reduction' ? 'trending-down' : 'reload'}
                        size={16}
                        color="#2E7D32"
                      />
                      <ThemedText style={styles.goalTypeText}>
                        {goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}
                      </ThemedText>
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
                    <ThemedText style={styles.progressText}>
                      {goal.progress.toFixed(1)} / {goal.target.toFixed(1)} kg
                    </ThemedText>
                  </View>

                  <View style={styles.goalFooter}>
                    <View style={styles.deadlineContainer}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <ThemedText style={styles.deadlineText}>
                        Due: {new Date(goal.end_date).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.timeframeText}>
                      {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color="#A5D6A7" />
              <ThemedText style={styles.emptyStateText}>
                No active goals. Set your first sustainability goal!
              </ThemedText>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/goals/add')}
              >
                <ThemedText style={styles.addButtonText}>Create Goal</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
            <TouchableOpacity onPress={() => router.push('/waste')}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          {recentLogs.length > 0 ? (
            <View style={styles.activityList}>
              {recentLogs.map((log) => (
                <View key={log.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="leaf-outline" size={24} color="#2E7D32" />
                  </View>
                  <View style={styles.activityContent}>
                    <ThemedText style={styles.activityTitle}>
                      {log.sub_category_name}
                    </ThemedText>
                    <ThemedText style={styles.activitySubtitle}>
                      {new Date(log.date_logged).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </ThemedText>
                  </View>
                  <View style={styles.activityScore}>
                    <ThemedText style={styles.scoreText}>+{log.score.toFixed(1)}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color="#A5D6A7" />
              <ThemedText style={styles.emptyStateText}>
                No recent waste logs. Start tracking your waste!
              </ThemedText>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/waste/add')}
              >
                <ThemedText style={styles.addButtonText}>Add Waste Log</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonSection}>
          <ThemedText style={styles.comingSoonTitle}>Coming Soon</ThemedText>
          <View style={styles.comingSoonGrid}>
            <View style={styles.comingSoonItem}>
              <Ionicons name="trophy-outline" size={32} color="#A5D6A7" />
              <ThemedText style={styles.comingSoonText}>Challenges</ThemedText>
            </View>
            <View style={styles.comingSoonItem}>
              <Ionicons name="people-outline" size={32} color="#A5D6A7" />
              <ThemedText style={styles.comingSoonText}>Friends</ThemedText>
            </View>
            <View style={styles.comingSoonItem}>
              <Ionicons name="trending-up-outline" size={32} color="#A5D6A7" />
              <ThemedText style={styles.comingSoonText}>Achievements</ThemedText>
            </View>
            <View style={styles.comingSoonItem}>
              <Ionicons name="chatbox-outline" size={32} color="#A5D6A7" />
              <ThemedText style={styles.comingSoonText}>Forums</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  viewAllText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAllText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  activityScore: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  comingSoonSection: {
    padding: 20,
    marginTop: 8,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  comingSoonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  comingSoonItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    gap: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666',
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalTypeText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: '#666',
  },
  timeframeText: {
    fontSize: 12,
    color: '#666',
  },
}); 