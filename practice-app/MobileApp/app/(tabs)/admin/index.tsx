import TokenManager from "@/app/tokenManager";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { API_ENDPOINTS, UserProfile } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState, memo, useMemo, useEffect } from "react";
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  ScrollView,
  FlatList,
  TextInput,
  Alert
} from "react-native";

interface AdminStats {
  totalUsers: number;
  pendingRequests: number;
}

interface ExtendedUserProfile extends UserProfile {
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

// Component for rendering the static parts of the dashboard and user search bar
const AdminDashboardStaticContent = memo(({
  stats,
  isUserManagementVisible,
  toggleUserManagementVisibility,
  searchQueryUsers,
  handleUserSearch,
  isRenderCategoryRequestButtonAlways = false,
}: {
  stats: AdminStats | null;
  isUserManagementVisible: boolean;
  toggleUserManagementVisibility: () => void;
  searchQueryUsers: string;
  handleUserSearch: (text: string) => void;
  isRenderCategoryRequestButtonAlways?: boolean;
}) => {
  return (
    <>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Admin Dashboard</ThemedText>
        <ThemedText style={styles.subText}>Manage your application</ThemedText>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Ionicons name="people" size={28} color="#2E7D32" />
          <ThemedText style={styles.statsValue}>{stats?.totalUsers || 0}</ThemedText>
          <ThemedText style={styles.statsLabel}>Total Users</ThemedText>
        </View>
        
        <View style={styles.statsCard}>
          <Ionicons name="list" size={28} color="#2E7D32" />
          <ThemedText style={styles.statsValue}>{stats?.pendingRequests || 0}</ThemedText>
          <ThemedText style={styles.statsLabel}>Pending Requests</ThemedText>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <ThemedText style={styles.sectionTitle}>Administrative Actions</ThemedText>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={toggleUserManagementVisibility}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="people" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionTextContainer}>
            <ThemedText style={styles.actionTitle}>User Management</ThemedText>
            <ThemedText style={styles.actionDescription}>View, edit, and manage user accounts</ThemedText>
          </View>
          <Ionicons name={isUserManagementVisible ? "chevron-down" : "chevron-forward"} size={24} color="#666" />
        </TouchableOpacity>
        
        {isUserManagementVisible && (
          <View style={styles.userSearchContainerOutsideList}> 
            <Ionicons name="search" size={20} color="#666" style={styles.userSearchIcon} />
            <TextInput
              style={styles.userSearchInput}
              placeholder="Search users..."
              value={searchQueryUsers}
              onChangeText={handleUserSearch}
              autoCapitalize="none"
              blurOnSubmit={false}
              keyboardShouldPersistTaps="always"
            />
            {searchQueryUsers.length > 0 && (
              <TouchableOpacity onPress={() => handleUserSearch("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Render Category Requests button if not expanding users OR if explicitly told to always render */}
        {(isRenderCategoryRequestButtonAlways || !isUserManagementVisible) && (
          <TouchableOpacity 
            style={styles.actionButton}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="list" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <ThemedText style={styles.actionTitle}>Category Requests</ThemedText>
              <ThemedText style={styles.actionDescription}>Approve or reject category requests</ThemedText>
            </View>
            <Ionicons name={"chevron-forward"} size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
});

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [isUserManagementVisible, setIsUserManagementVisible] = useState(false);
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUserProfile[]>([]);
  const [searchQueryUsers, setSearchQueryUsers] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const usersResponse = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.USERS);
      let totalUsers = 0;
      
      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        totalUsers = userData.count || 0;
      }
      
      const requestsResponse = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.ADMIN.CATEGORY_REQUESTS);
      let pendingRequests = 0;
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        pendingRequests = requestsData.length || 0;
      }
      
      setStats({
        totalUsers,
        pendingRequests
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersList = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.USERS);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.results);
        setFilteredUsers(data.results);
      } else {
        console.error('Failed to fetch users list');
        Alert.alert("Error", "Failed to fetch users list.");
      }
    } catch (error) {
      console.error('Error fetching users list:', error);
      Alert.alert("Error", "An error occurred while fetching users list.");
    } finally {
      setIsLoadingUsers(false);
      setIsRefreshingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!stats) {
        setIsLoading(true);
        fetchStats().finally(() => setIsLoading(false));
      }
      if (isUserManagementVisible && users.length === 0) {
        fetchUsersList();
      }
    }, [isUserManagementVisible, users.length, stats])
  );
  
  const toggleUserManagementVisibility = useCallback(() => {
    const newVisibility = !isUserManagementVisible;
    setIsUserManagementVisible(newVisibility);
    if (newVisibility && users.length === 0) {
      fetchUsersList();
    }
  }, [isUserManagementVisible, users.length]);

  const handleUserSearch = useCallback((text: string) => {
    setSearchQueryUsers(text);
    if (text.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedText = text.toLowerCase();
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(lowercasedText) ||
        user.email.toLowerCase().includes(lowercasedText) ||
        (user.first_name && user.first_name.toLowerCase().includes(lowercasedText)) ||
        (user.last_name && user.last_name.toLowerCase().includes(lowercasedText))
      );
      setFilteredUsers(filtered);
    }
  }, [users]);

  const handleUserRefresh = () => {
    setIsRefreshingUsers(true);
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
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <ThemedText style={styles.username}>{item.username}</ThemedText>
            <ThemedText style={styles.email}>{item.email}</ThemedText>
          </View>
          <View style={styles.badgesContainer}>
            <View style={[
              styles.roleBadge,
              item.role === 'ADMIN' ? styles.adminBadge : 
              item.role === 'MODERATOR' ? styles.moderatorBadge : 
              styles.userBadge
            ]}>
              <ThemedText style={styles.roleBadgeText}>{item.role}</ThemedText>
            </View>
            {!item.is_active && (
              <View style={styles.inactiveBadge}><ThemedText style={styles.inactiveBadgeText}>Inactive</ThemedText></View>
            )}
          </View>
        </View>
        <View style={styles.userActions}>
          <TouchableOpacity 
            style={[styles.userActionButton, !item.is_active ? styles.activateButton : styles.deactivateButton]}
            onPress={() => handleToggleActive(item)}
          >
            <Ionicons name={!item.is_active ? "checkmark-circle" : "ban"} size={20} color="white" />
            <ThemedText style={styles.userActionButtonText}>{!item.is_active ? "Activate" : "Deactivate"}</ThemedText>
          </TouchableOpacity>
          {item.role === 'USER' && (
            <TouchableOpacity
              style={[styles.userActionButton, styles.moderatorButton]}
              onPress={() => handleRoleChange(item, 'MODERATOR')}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="white" />
              <ThemedText style={styles.userActionButtonText}>Make Moderator</ThemedText>
            </TouchableOpacity>
          )}
          {item.role === 'MODERATOR' && (
            <TouchableOpacity
              style={[styles.userActionButton, styles.userRoleButton]}
              onPress={() => handleRoleChange(item, 'USER')}
            >
              <Ionicons name="person-outline" size={20} color="white" />
              <ThemedText style={styles.userActionButtonText}>Make User</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Memoize these components to prevent re-rendering
  const ListHeader = useMemo(() => (
    <AdminDashboardStaticContent 
      stats={stats}
      isUserManagementVisible={isUserManagementVisible}
      toggleUserManagementVisibility={toggleUserManagementVisibility}
      searchQueryUsers={searchQueryUsers}
      handleUserSearch={handleUserSearch}
      isRenderCategoryRequestButtonAlways={false}
    />
  ), [stats, isUserManagementVisible, searchQueryUsers]);

  const ListFooter = useMemo(() => (
    isUserManagementVisible ? (
      <View style={styles.footerContainer}> 
        <TouchableOpacity 
          style={styles.actionButton}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="list" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionTextContainer}>
            <ThemedText style={styles.actionTitle}>Category Requests</ThemedText>
            <ThemedText style={styles.actionDescription}>Approve or reject category requests</ThemedText>
          </View>
          <Ionicons name={"chevron-forward"} size={24} color="#666" />
        </TouchableOpacity>
      </View>
    ) : null
  ), [isUserManagementVisible]);

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={styles.loadingIndicator} />
      ) : (
        <>
          {isUserManagementVisible ? (
            <FlatList
              key={contentKey}
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id.toString()}
              ListHeaderComponent={ListHeader}
              ListFooterComponent={ListFooter}
              contentContainerStyle={styles.listContentContainer}
              refreshing={isRefreshingUsers}
              onRefresh={handleUserRefresh}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              ListEmptyComponent={() => (
                isLoadingUsers ? (
                    <View style={styles.userEmptyContainer}> 
                        <ActivityIndicator size="large" color="#2E7D32" />
                    </View>
                ) : (
                    <View style={styles.userEmptyContainer}>
                        <Ionicons name="people-outline" size={50} color="#CCC" />
                        <ThemedText style={styles.userEmptyText}>
                        {searchQueryUsers.length > 0 ? "No users match your search" : "No users found"}
                        </ThemedText>
                    </View>
                )
              )}
            />
          ) : (
            <ScrollView 
              style={styles.contentScrollView}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <AdminDashboardStaticContent 
                stats={stats}
                isUserManagementVisible={isUserManagementVisible}
                toggleUserManagementVisibility={toggleUserManagementVisibility}
                searchQueryUsers={searchQueryUsers}
                handleUserSearch={handleUserSearch}
                isRenderCategoryRequestButtonAlways={true}
              />
            </ScrollView>
          )}
        </>
      )}
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
  contentScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerText: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  subText: { fontSize: 16, color: '#666' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statsCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flex: 0.48, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  statsValue: { fontSize: 24, fontWeight: '700', marginVertical: 8 },
  statsLabel: { fontSize: 14, color: '#666' },
  actionsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  actionButton: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  actionIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  actionDescription: { fontSize: 14, color: '#666' },
  
  userSearchContainerOutsideList: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userSearchIcon: { marginRight: 8 },
  userSearchInput: { 
    flex: 1, 
    height: 36, 
    fontSize: 12
  },
  
  userCard: {
    backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  userInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  nameContainer: { flex: 1 },
  username: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  email: { fontSize: 13, color: '#666' },
  badgesContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  adminBadge: { backgroundColor: '#D32F2F' },
  moderatorBadge: { backgroundColor: '#FF9800' },
  userBadge: { backgroundColor: '#2E7D32' },
  roleBadgeText: { fontSize: 11, color: '#FFFFFF', fontWeight: '500' },
  inactiveBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, backgroundColor: '#9E9E9E' },
  inactiveBadgeText: { fontSize: 11, color: '#FFFFFF', fontWeight: '500' },
  userActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  userActionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 6 },
  activateButton: { backgroundColor: '#2E7D32' },
  deactivateButton: { backgroundColor: '#D32F2F' },
  moderatorButton: { backgroundColor: '#FF9800' },
  userRoleButton: { backgroundColor: '#0288D1' },
  userActionButtonText: { color: '#FFFFFF', fontWeight: '500', fontSize: 13 },
  userEmptyContainer: { alignItems: 'center', paddingVertical: 40 },
  userEmptyText: { fontSize: 15, color: '#666', marginTop: 10, textAlign: 'center' },
  loadingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
}); 