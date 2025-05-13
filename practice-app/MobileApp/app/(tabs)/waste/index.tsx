import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  const router = useRouter();

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
    } finally {
      setIsLoading(false);
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

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSubCategories();
      fetchLogs();
      fetchStats();
    }, [])
  );

  const getSubCategoryUnit = (subCategoryId: number) => {
    const subCategory = subCategories.find(sc => sc.id === subCategoryId);
    return subCategory?.unit || '';
  };

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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>
              {stats.total_score?.toFixed(1) || '0.0'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Score</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>
              {logs.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Logs</ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/waste/add')}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <ThemedText style={styles.addButtonText}>Add Waste Log</ThemedText>
        </TouchableOpacity>

        {/* Waste Logs List */}
        <View style={styles.logsContainer}>
          {logs.map((log) => (
            <TouchableOpacity
              key={log.id}
              style={styles.logCard}
              onPress={() => router.push(`/waste/${log.id}`)}
            >
              <View style={styles.logHeader}>
                <ThemedText style={styles.logTitle}>{log.sub_category_name}</ThemedText>
                <ThemedText style={styles.logScore}>+{log.score} pts</ThemedText>
              </View>
              <View style={styles.logDetails}>
                <ThemedText style={styles.logQuantity}>
                  Quantity: {log.quantity} {getSubCategoryUnit(log.sub_category)}
                </ThemedText>
                <ThemedText style={styles.logDate}>
                  {new Date(log.date_logged).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </ThemedText>
              </View>
              {log.disposal_location && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <ThemedText style={styles.locationText}>
                    {log.disposal_location}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  logsContainer: {
    gap: 12,
  },
  logCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  logScore: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logQuantity: {
    fontSize: 14,
    color: '#666',
  },
  logDate: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
}); 