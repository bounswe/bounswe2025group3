import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

interface ModeratorStats {
  total_users: number;
  pending_category_requests: number;
}

export default function ModeratorDashboard() {
  const [stats, setStats] = useState<ModeratorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Navigation functions
  const navigateToUserManagement = useCallback(() => {
    router.push('/moderator/user-management' as any);
  }, [router]);

  const navigateToCategoryRequests = useCallback(() => {
    router.push('/moderator/category-requests' as any);
  }, [router]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Get category requests count
      const categoryResponse = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.WASTE.ADMIN.CATEGORY_REQUESTS
      );
      
      let pendingRequests = 0;
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        // Process results from paginated response properly
        const requestsData = categoryData.results || [];
        if (Array.isArray(requestsData)) {
          pendingRequests = requestsData.filter((req: any) => 
            req.status && req.status.toLowerCase() === 'pending'
          ).length;
        }
      } else {
        console.error('Failed to fetch category requests. Status:', categoryResponse.status);
      }
      
      // Get user count for moderator
      const usersResponse = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.USERS
      );
      
      let usersCount = 0;
      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        // For moderators, we should only count regular users
        if (userData.results && Array.isArray(userData.results)) {
          usersCount = userData.results.filter(
            (u: any) => u.role === 'USER'
          ).length;
        } else {
          usersCount = userData.count || 0;
        }
      } else {
        console.error('Failed to fetch users. Status:', usersResponse.status);
      }

      setStats({
        pending_category_requests: pendingRequests,
        total_users: usersCount,
      });
    } catch (error) {
      console.error('Error fetching moderator stats:', error);
      // Set default values when there's an error
      setStats({
        pending_category_requests: 0,
        total_users: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const statCards = useMemo(() => [
    {
      title: "Users",
      count: stats?.total_users || 0,
      icon: "people-outline",
      color: "#1976D2",
      onPress: navigateToUserManagement,
      description: "Manage regular users",
    },
    {
      title: "Category Requests",
      count: stats?.pending_category_requests || 0,
      icon: "file-tray-full-outline",
      color: "#FF9800",
      onPress: navigateToCategoryRequests,
      description: "Review pending category requests",
    }
  ], [stats, navigateToUserManagement, navigateToCategoryRequests]);

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
        <ThemedText style={styles.headerTitle}>Moderator Dashboard</ThemedText>
      </View>
      
      <View style={styles.statsContainer}>
        {statCards.map((card, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.statCard}
            onPress={card.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
              <Ionicons name={card.icon as any} size={28} color="white" />
            </View>
            <View style={styles.statInfo}>
              <ThemedText style={styles.statTitle}>{card.title}</ThemedText>
              <ThemedText style={styles.statCount}>{card.count}</ThemedText>
              <ThemedText style={styles.statDescription}>{card.description}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={20} color="#666" />
        <ThemedText style={styles.disclaimerText}>
          As a moderator, you can manage regular users and review category requests,
          but you don't have full administrative privileges.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    flexDirection: 'row',
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
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 4,
  },
  statDescription: {
    fontSize: 14,
    color: '#666',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    alignItems: 'flex-start',
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 