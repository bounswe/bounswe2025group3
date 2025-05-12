import TokenManager from "@/app/tokenManager";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { API_ENDPOINTS, UserProfile } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  FlatList,
  TextInput,
  Alert
} from "react-native";

interface ExtendedUserProfile extends UserProfile {
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export default function ModeratorUserManagementScreen() {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchUsersList = async () => {
    setIsLoading(true);
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.USERS
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Filter out admins and moderators - moderators should only see regular users
        const regularUsers = (data.results || []).filter(
          (user: ExtendedUserProfile) => user.role === 'USER'
        );
        
        setUsers(regularUsers);
        setFilteredUsers(regularUsers);
      } else {
        console.error('Failed to fetch users list, status:', response.status);
        Alert.alert("Error", "Failed to fetch users list.");
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users list:', error);
      Alert.alert("Error", "An error occurred while fetching users list.");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsersList();
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === "") {
      setFilteredUsers(users);
      return;
    }
    
    const lowercasedText = text.toLowerCase();
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(lowercasedText) ||
      user.email.toLowerCase().includes(lowercasedText) ||
      (user.first_name && user.first_name.toLowerCase().includes(lowercasedText)) ||
      (user.last_name && user.last_name.toLowerCase().includes(lowercasedText))
    );
    setFilteredUsers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsersList();
  };

  const handleToggleActive = async (user: ExtendedUserProfile) => {
    try {
      const newStatus = !user.is_active;
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.SET_ACTIVE_STATUS(user.id),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: newStatus }),
        }
      );
      if (response.ok) {
        const updateUserState = (u: ExtendedUserProfile) => u.id === user.id ? { ...u, is_active: newStatus } : u;
        setUsers(prevUsers => prevUsers.map(updateUserState));
        setFilteredUsers(prevFilteredUsers => prevFilteredUsers.map(updateUserState));
        Alert.alert("Success", `User ${user.username} has been ${newStatus ? 'activated' : 'deactivated'}.`);
      } else {
        Alert.alert("Error", "Failed to update user status");
      }
    } catch (error) {
      console.error('Error toggling user active status:', error);
      Alert.alert("Error", "An error occurred while updating user status");
    }
  };

  const renderUserItem = ({ item }: { item: ExtendedUserProfile }) => {
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.nameContainer}>
            <ThemedText style={styles.username}>{item.username || item.email}</ThemedText>
            <ThemedText style={styles.email}>{item.email}</ThemedText>
          </View>
          <View style={styles.badgesContainer}>
            <View style={styles.userBadge}>
              <ThemedText style={styles.roleBadgeText}>{item.role}</ThemedText>
            </View>
            {!item.is_active && (
              <View style={styles.inactiveBadge}>
                <ThemedText style={styles.inactiveBadgeText}>Inactive</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Name:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {(item.first_name || item.last_name) ? 
                `${item.first_name || ''} ${item.last_name || ''}`.trim() : 
                'Not provided'}
            </ThemedText>
          </View>
          {item.bio && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Bio:</ThemedText>
              <ThemedText style={styles.detailValue}>{item.bio}</ThemedText>
            </View>
          )}
          {(item.city || item.country) && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Location:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {[item.city, item.country].filter(Boolean).join(', ')}
              </ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, !item.is_active ? styles.activateButton : styles.deactivateButton]}
            onPress={() => handleToggleActive(item)}
          >
            <Ionicons name={!item.is_active ? "checkmark-circle" : "ban"} size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>
              {!item.is_active ? "Activate" : "Deactivate"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = useMemo(() => (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>Regular Users</ThemedText>
      <ThemedText style={styles.headerSubtitle}>
        As a moderator, you can only manage regular users. 
        You cannot see or manage other moderators or admin accounts.
      </ThemedText>
    </View>
  ), []);

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color="#CCC" />
            <ThemedText style={styles.emptyText}>
              {searchQuery.length > 0 
                ? "No users match your search" 
                : "No users found"}
            </ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#9E9E9E',
  },
  inactiveBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  activateButton: {
    backgroundColor: '#2E7D32',
  },
  deactivateButton: {
    backgroundColor: '#D32F2F',
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
}); 