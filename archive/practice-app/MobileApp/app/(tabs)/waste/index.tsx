import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator, RefreshControl, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Define consistent colors from our web frontend
const GREENER_COLORS = {
  primary: '#2E7D32',
  secondary: '#56ea62',
  primaryDark: '#122e1a',
  primaryLight: '#88eb9a',
  background: '#E8F5E9',
  white: '#ffffff',
  text: {
    primary: '#333333',
    secondary: '#555555',
    light: '#666666',
  }
};

interface SubCategory {
  id: number;
  name: string;
  unit: string;
  score_per_unit: string;
}

interface WasteLog {
  id: number;
  sub_category_name: string;
  quantity: string;
  date_logged: string;
  score: number;
  disposal_location: string | null;
  sub_category: number;
}

interface Stats {
  total_score: number;
  total_logs: number;
}

export default function WasteLogsScreen() {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_score: 0,
    total_logs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchSubCategories(),
        fetchLogs(),
        fetchStats()
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.SUBCATEGORIES);
      
      if (response.ok) {
        const data = await response.json();
        setSubCategories(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOGS);
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching waste logs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.MY_SCORE);
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          total_score: data.total_score || 0,
          total_logs: data.total_logs || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const getSubCategoryUnit = (subCategoryId: number) => {
    const subCategory = subCategories.find(sc => sc.id === subCategoryId);
    return subCategory?.unit || '';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREENER_COLORS.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[GREENER_COLORS.primaryLight, GREENER_COLORS.primaryDark]}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image 
              source={require('@/assets/images/greener-logo.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <ThemedText style={styles.headerTitle}>Waste Logs</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREENER_COLORS.secondary]} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trophy-outline" size={32} color={GREENER_COLORS.secondary} style={styles.statIcon} />
            <ThemedText style={styles.statValue}>
              {stats.total_score?.toFixed(1) || '0.0'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Score</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={32} color={GREENER_COLORS.secondary} style={styles.statIcon} />
            <ThemedText style={styles.statValue}>
              {logs.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Logs</ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/waste/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={24} color={GREENER_COLORS.white} />
          <ThemedText style={styles.addButtonText}>Add Waste Log</ThemedText>
        </TouchableOpacity>

        <View style={styles.sectionTitleContainer}>
          <ThemedText style={styles.sectionTitle}>Your Logs</ThemedText>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => router.push('/waste/custom_category_request')}
          >
            <ThemedText style={styles.requestButtonText}>Request Category</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Waste Logs List */}
        <View style={styles.logsContainer}>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TouchableOpacity
                key={log.id}
                style={styles.logCard}
                onPress={() => router.push(`/waste/${log.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logTitleContainer}>
                    <Ionicons name="leaf-outline" size={20} color={GREENER_COLORS.secondary} style={styles.logIcon} />
                    <ThemedText style={styles.logTitle}>{log.sub_category_name}</ThemedText>
                  </View>
                  <View style={styles.scoreContainer}>
                    <ThemedText style={styles.logScore}>+{log.score.toFixed(1)}</ThemedText>
                  </View>
                </View>
                <View style={styles.logDetails}>
                  <ThemedText style={styles.logQuantity}>
                    Quantity: {log.quantity} {getSubCategoryUnit(log.sub_category)}
                  </ThemedText>
                  <ThemedText style={styles.logDate}>
                    {new Date(log.date_logged).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </ThemedText>
                </View>
                {log.disposal_location && (
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={16} color={GREENER_COLORS.text.light} />
                    <ThemedText style={styles.locationText}>
                      {log.disposal_location}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.viewDetailsButton}>
                  <ThemedText style={styles.viewDetailsText}>View Details</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={GREENER_COLORS.primary} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={GREENER_COLORS.secondary} />
              <ThemedText style={styles.emptyStateText}>
                No waste logs yet. Start tracking your waste!
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREENER_COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GREENER_COLORS.background,
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
    color: GREENER_COLORS.white,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    backgroundColor: GREENER_COLORS.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: GREENER_COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: GREENER_COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: GREENER_COLORS.text.light,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: GREENER_COLORS.primary,
  },
  logsContainer: {
    gap: 12,
  },
  logCard: {
    backgroundColor: GREENER_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: GREENER_COLORS.background,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logIcon: {
    marginRight: 8,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: GREENER_COLORS.text.primary,
  },
  scoreContainer: {
    backgroundColor: GREENER_COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logScore: {
    fontSize: 14,
    color: GREENER_COLORS.secondary,
    fontWeight: '600',
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logQuantity: {
    fontSize: 14,
    color: GREENER_COLORS.text.light,
  },
  logDate: {
    fontSize: 14,
    color: GREENER_COLORS.text.light,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREENER_COLORS.secondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: GREENER_COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  requestButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: GREENER_COLORS.background,
    borderRadius: 8,
  },
  requestButtonText: {
    fontSize: 14,
    color: GREENER_COLORS.primary,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: GREENER_COLORS.text.light,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: GREENER_COLORS.background,
  },
  viewDetailsText: {
    fontSize: 14,
    color: GREENER_COLORS.primary,
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: GREENER_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREENER_COLORS.background,
  },
  emptyStateText: {
    fontSize: 16,
    color: GREENER_COLORS.text.light,
    textAlign: 'center',
    marginTop: 16,
  },
}); 