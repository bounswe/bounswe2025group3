import TokenManager from "@/app/tokenManager";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { API_ENDPOINTS, UserProfile } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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

export default function UserManagementScreen() {
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
        setUsers(data.results || []);
        setFilteredUsers(data.results || []);
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
    if (user.role === 'ADMIN') {
      Alert.alert("Error", "Admin users cannot be deactivated from this interface.");
      return;
    }
    
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

  const handleRoleChange = async (user: ExtendedUserProfile, newRole: 'USER' | 'MODERATOR') => {
    if (user.role === 'ADMIN') {
      Alert.alert("Error", "Admin roles cannot be changed from this interface.");
      return;
    }
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.SET_USER_ROLE(user.id),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (response.ok) {
        const updateUserState = (u: ExtendedUserProfile) => u.id === user.id ? { ...u, role: newRole } : u;
        setUsers(prevUsers => prevUsers.map(updateUserState));
        setFilteredUsers(prevFilteredUsers => prevFilteredUsers.map(updateUserState));
        Alert.alert("Success", `User ${user.username}'s role has been updated to ${newRole}.`);
      } else {
        const errorData = await response.json().catch(() => ({ detail: "Failed to update user role" }));
        Alert.alert("Error", errorData.detail || "Failed to update user role");
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert("Error", "An error occurred while updating user role");
    }
  };

  const renderUserItem = ({ item }: { item: ExtendedUserProfile }) => {
    const isAdmin = item.role === 'ADMIN';
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.nameContainer}>
            <ThemedText style={styles.username}>{item.username || item.email}</ThemedText>
            <ThemedText style={styles.email}>{item.email}</ThemedText>
          </View>
          <View style={styles.badgesContainer}>
            <View style={[
              styles.roleBadge,
              isAdmin ? styles.adminBadge : 
              item.role === 'MODERATOR' ? styles.moderatorBadge : 
              styles.userBadge
            ]}>
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
        
        {!isAdmin && (
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
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.roleButton]}
              onPress={() => 
                handleRoleChange(
                  item, 
                  item.role === 'USER' ? 'MODERATOR' : 'USER'
                )
              }
            >
              <Ionicons name="swap-horizontal" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>
                {item.role === 'USER' ? "Make Moderator" : "Make User"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
        
        {isAdmin && (
          <View style={styles.protectedAccountContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#673AB7" />
            <ThemedText style={styles.protectedAccountText}>
              Admin accounts cannot be modified from this interface
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#673AB7" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>User Management</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          View and manage all users in the system
        </ThemedText>
      </View>
      
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
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
  adminBadge: {
    backgroundColor: '#673AB7',
  },
  moderatorBadge: {
    backgroundColor: '#4CAF50',
  },
  userBadge: {
    backgroundColor: '#2196F3',
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
    backgroundColor: '#4CAF50',
  },
  deactivateButton: {
    backgroundColor: '#F44336',
  },
  roleButton: {
    backgroundColor: '#FF9800',
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
  protectedAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginTop: 8,
  },
  protectedAccountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
  },
}); 