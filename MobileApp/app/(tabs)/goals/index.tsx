import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

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

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchGoals = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.LIST);
      if (response.ok) {
        const data = await response.json();
        setGoals(data.results);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      style={styles.goalItem}
      onPress={() => router.push({
        pathname: "/goals/[id]",
        params: { id: item.id }
      })}
    >
      <View style={styles.goalHeader}>
        <ThemedText style={styles.goalTitle}>{item.category.name}</ThemedText>
        <View style={[
          styles.statusBadge,
          item.is_complete ? styles.statusComplete : styles.statusInProgress
        ]}>
          <ThemedText style={styles.statusText}>
            {item.status}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.goalDetails}>
        <View style={styles.goalInfo}>
          <Ionicons
            name={item.goal_type === 'reduction' ? 'trending-down' : 'reload'}
            size={20}
            color="#2E7D32"
          />
          <ThemedText style={styles.goalInfoText}>
            {item.goal_type.charAt(0).toUpperCase() + item.goal_type.slice(1)}
          </ThemedText>
        </View>
        <View style={styles.goalInfo}>
          <Ionicons name="calendar" size={20} color="#2E7D32" />
          <ThemedText style={styles.goalInfoText}>
            {item.timeframe.charAt(0).toUpperCase() + item.timeframe.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.dateContainer}>
        <View style={styles.dateInfo}>
          <Ionicons name="play" size={16} color="#666" />
          <ThemedText style={styles.dateText}>
            Start: {new Date(item.start_date).toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.dateInfo}>
          <Ionicons name="stop" size={16} color="#666" />
          <ThemedText style={styles.dateText}>
            End: {new Date(item.end_date).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(item.progress / item.target) * 100}%` },
            ]}
          />
        </View>
        <ThemedText style={styles.progressText}>
          {item.progress.toFixed(1)} / {item.target.toFixed(1)} kg
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>My Goals</ThemedText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/goals/add")}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.templatesButton}
            onPress={() => router.push({ pathname: "/goals/templates" })}
          >
            <Ionicons name="list-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag" size={48} color="#2E7D32" />
          <ThemedText style={styles.emptyText}>
            No goals yet. Create your first sustainability goal!
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#2E7D32',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templatesButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2E7D32',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  list: {
    padding: 20,
  },
  goalItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusComplete: {
    backgroundColor: '#E8F5E9',
  },
  statusInProgress: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  goalDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalInfoText: {
    fontSize: 14,
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
 