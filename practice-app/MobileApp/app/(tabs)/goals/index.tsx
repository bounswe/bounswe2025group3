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
  Image,
  SafeAreaView,
} from 'react-native';
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
            name="leaf"
            size={20}
            color="#2E7D32"
          />
          <ThemedText style={styles.goalInfoText}>
            Goal
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
            Start: {new Date(item.start_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </ThemedText>
        </View>
        <View style={styles.dateInfo}>
          <Ionicons name="stop" size={16} color="#666" />
          <ThemedText style={styles.dateText}>
            End: {new Date(item.end_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
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
            <ThemedText style={styles.headerTitle}>My Goals</ThemedText>
          </View>
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
              <Ionicons name="list-outline" size={24} color={GREENER_COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag" size={48} color={GREENER_COLORS.secondary} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: GREENER_COLORS.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templatesButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
 
