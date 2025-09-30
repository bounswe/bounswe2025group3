import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator, Image, SafeAreaView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnvironmentalNews } from '@/components/EnvironmentalNews';
import EnvironmentalStat from '@/components/EnvironmentalStat';

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

// Mock eco-tips (similar to web frontend)
const ecoTips = [
  { id: 1, text: 'Switch to reusable bags to cut plastic waste.', related_category: 'Plastic', topic: 'Waste Reduction' },
  { id: 2, text: 'Compost food scraps to enrich your garden soil.', related_category: 'Organic', topic: 'Waste Reduction' },
  { id: 3, text: 'Recycle old electronics at certified centers.', related_category: 'Electronic', topic: 'Waste Reduction' },
  { id: 4, text: 'Fix leaks to conserve water at home.', related_category: null, topic: 'Water Conservation' },
];

export default function HomeScreen() {
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [recentLogs, setRecentLogs] = useState<WasteLog[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
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
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      
      // Rotate through eco tips every 5 seconds
      const interval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % ecoTips.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }, [])
  );

  const handlePrevTip = () => {
    setCurrentTip((prev) => (prev - 1 + ecoTips.length) % ecoTips.length);
  };

  const handleNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % ecoTips.length);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#56ea62" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#88eb9a', '#122e1a']}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image 
              source={require('@/assets/images/greener-logo.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <ThemedText style={styles.headerTitle}>GREENER</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#56ea62']}
            tintColor="#56ea62"
            title="Refreshing..."
            titleColor="#56ea62"
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeText}>Welcome to GREENER</ThemedText>
          <ThemedText style={styles.subtitle}>Make Every Day a Zero Waste Day</ThemedText>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Ionicons name="leaf" size={24} color="#56ea62" />
            <ThemedText style={styles.statsTitle}>Your Impact Score</ThemedText>
          </View>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreValueContainer}>
              <ThemedText style={styles.scoreValue}>
                {userScore?.total_score ? Number(userScore.total_score).toFixed(1) : '0.0'}
              </ThemedText>
            </View>
            <ThemedText style={styles.scoreLabel}>Environmental Impact Points</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/waste')}
          >
            <ThemedText style={styles.viewAllText}>View Waste Log</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#56ea62" />
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
                        name="leaf"
                        size={16}
                        color="#56ea62"
                      />
                      <ThemedText style={styles.goalTypeText}>
                        Goal
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
                        Due: {new Date(goal.end_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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
              <Ionicons name="flag-outline" size={48} color="#56ea62" />
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

        {/* Eco-Tips Section (from web) */}
        <View style={styles.tipsSection}>
          <ThemedText style={styles.tipsTitle}>Sustainability Tips</ThemedText>
          <View style={styles.tipsCarousel}>
            <TouchableOpacity onPress={handlePrevTip} style={styles.carouselArrow}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.tipCard}>
              <ThemedText style={styles.tipText}>{ecoTips[currentTip].text}</ThemedText>
              <ThemedText style={styles.tipCategory}>
                {ecoTips[currentTip].related_category
                  ? `Category: ${ecoTips[currentTip].related_category}`
                  : `Topic: ${ecoTips[currentTip].topic}`}
              </ThemedText>
            </View>
            
            <TouchableOpacity onPress={handleNextTip} style={styles.carouselArrow}>
              <Ionicons name="chevron-forward" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
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
                    <Ionicons name="leaf-outline" size={24} color="#56ea62" />
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
              <Ionicons name="leaf-outline" size={48} color="#56ea62" />
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
              <Ionicons name="trophy-outline" size={32} color="#56ea62" />
              <ThemedText style={styles.comingSoonText}>Challenges</ThemedText>
            </View>
            <View style={styles.comingSoonItem}>
              <Ionicons name="people-outline" size={32} color="#56ea62" />
              <ThemedText style={styles.comingSoonText}>Friends</ThemedText>
            </View>
            <View style={styles.comingSoonItem}>
              <Ionicons name="trending-up-outline" size={32} color="#56ea62" />
              <ThemedText style={styles.comingSoonText}>Achievements</ThemedText>
            </View>
            <View style={styles.comingSoonItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color="#56ea62" />
              <ThemedText style={styles.comingSoonText}>Forum</ThemedText>
            </View>
          </View>
        </View>

        {/* Environmental News Section */}
        <View style={styles.newsSection}>
          <EnvironmentalNews />
        </View>

        {/* Environmental Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Environmental Statistics</ThemedText>
          </View>
          <EnvironmentalStat />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9'
  },
  headerBackground: {
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#E8F5E9',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsCard: {
    margin: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#2E7D32',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 1,
    paddingVertical: 10,
  },
  scoreValueContainer: {
    padding: 8,
    minWidth: 100, 
    minHeight: 44, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9f0', // Very light green background
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#56ea62',
    marginBottom: 0,
    includeFontPadding: false,
    textAlign: 'center',
    lineHeight: 32,
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
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  viewAllText: {
    color: '#56ea62',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  tipsSection: {
    padding: 20,
    backgroundColor: 'rgba(18, 46, 26, 0.9)',
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  tipsCarousel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselArrow: {
    padding: 8,
  },
  tipCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  tipCategory: {
    fontSize: 12,
    color: '#56ea62',
    textAlign: 'center',
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
    color: '#2E7D32',
  },
  seeAllText: {
    color: '#56ea62',
    fontSize: 14,
    fontWeight: '500',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
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
    color: '#333',
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
    color: '#56ea62',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: '#56ea62',
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
    backgroundColor: '#E8F5E9',
    marginTop: 8,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2E7D32',
    textAlign: 'center',
  },
  comingSoonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  comingSoonItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8F5E9',
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
    color: '#333333',
  },
  goalType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  goalTypeText: {
    fontSize: 12,
    color: '#56ea62',
    fontWeight: '500',
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#56ea62',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
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
    color: '#666666',
  },
  timeframeText: {
    fontSize: 12,
    color: '#56ea62',
    fontWeight: '500',
  },
  newsSection: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsSection: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    paddingBottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
