import tokenManager from "@/services/tokenManager";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface AdminStats {
  total_users: number;
  moderators: number;
  admins: number;
  pending_category_requests: number;
}

const API_ENDPOINTS = {
  USER: {
    USERS: '/v1/user/users/',
    SET_ACTIVE_STATUS: (id: number) => `/v1/user/users/${id}/set-active-status/`,
    SET_USER_ROLE: (id: number) => `/v1/user/users/${id}/set-role/`
  },
  WASTE: {
    ADMIN: {
      CATEGORY_REQUESTS: '/v1/waste/admin/category-requests/'
    }
  }
};

interface ExtendedUserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    bio?: string;
    city?: string;
    country?: string;
    role: 'ADMIN' | 'MODERATOR' | 'USER';
    date_joined: string;
    notifications_enabled: boolean;
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
  router,
}: {
  stats: AdminStats | null;
  isUserManagementVisible: boolean;
  toggleUserManagementVisibility: () => void;
  searchQueryUsers: string;
  handleUserSearch: (text: string) => void;
  isRenderCategoryRequestButtonAlways?: boolean;
  router: any;
}) => {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
        <Text style={styles.subText}>Manage your application</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Ionicons name="people" size={28} color="#2E7D32" />
          <Text style={styles.statsValue}>{stats?.total_users || 0}</Text>
          <Text style={styles.statsLabel}>Total Users</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Ionicons name="shield" size={28} color="#2E7D32" />
          <Text style={styles.statsValue}>{stats?.moderators || 0}</Text>
          <Text style={styles.statsLabel}>Moderators</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Ionicons name="shield-checkmark" size={28} color="#2E7D32" />
          <Text style={styles.statsValue}>{stats?.admins || 0}</Text>
          <Text style={styles.statsLabel}>Admins</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Ionicons name="file-tray-full" size={28} color="#2E7D32" />
          <Text style={styles.statsValue}>{stats?.pending_category_requests || 0}</Text>
          <Text style={styles.statsLabel}>Pending Requests</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Administrative Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/home/admin/user-managament')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="people" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>User Management</Text>
            <Text style={styles.actionDescription}>View, edit, and manage user accounts</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
        
        {/* Render Category Requests button if not expanding users OR if explicitly told to always render */}
        {(isRenderCategoryRequestButtonAlways || !isUserManagementVisible) && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/home/admin/category-requests')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="list" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Category Requests</Text>
              <Text style={styles.actionDescription}>Approve or reject category requests</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
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
    setIsLoading(true);
    try {
      // Use authenticatedFetch to get user data
      const usersResponse = await tokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.USERS
      );
      
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        const usersData = data.results || [];
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        
        const stats = {
          total_users: 0,
          moderators: 0,
          admins: 0,
          pending_category_requests: 0
        };
        
        usersData.forEach((user: ExtendedUserProfile) => {
          if (user.role === 'USER') stats.total_users++;
          else if (user.role === 'MODERATOR') stats.moderators++;
          else if (user.role === 'ADMIN') stats.admins++;
        });
        
        // Get category requests count
        const categoryResponse = await tokenManager.authenticatedFetch(
          API_ENDPOINTS.WASTE.ADMIN.CATEGORY_REQUESTS
        );
        
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          const requestsData = categoryData.results || [];
          
          if (Array.isArray(requestsData)) {
            stats.pending_category_requests = requestsData.filter((req: any) => 
              req.status && req.status.toLowerCase() === 'pending'
            ).length;
          }
        }
        
        setStats(stats);
      } else {
        console.error('Failed to fetch users list, status:', usersResponse.status);
        Alert.alert("Error", "Failed to fetch admin data.");
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert("Error", "An error occurred while fetching admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersList = async () => {
    setIsLoadingUsers(true);
    try {
      // Use authenticatedFetch for API calls
      const response = await tokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.USERS
      );
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || []);
        setFilteredUsers(data.results || []);
      } else {
        console.error('Failed to fetch users list, status:', response.status);
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
    // Don't allow activating/deactivating admin users
    if (user.role === 'ADMIN') {
      Alert.alert("Error", "Admin users cannot be deactivated from this interface.");
      return;
    }
    
    try {
      const newStatus = !user.is_active;
      const response = await tokenManager.authenticatedFetch(
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
        
        // Refresh stats
        fetchStats();
        
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
    // Don't allow changing admin roles
    if (user.role === 'ADMIN') {
      Alert.alert("Error", "Admin roles cannot be changed from this interface.");
      return;
    }
    
    try {
      const response = await tokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.SET_USER_ROLE(user.id),
        {
          method: 'POST',
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
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
          <View style={styles.badgesContainer}>
            <View style={[
              styles.roleBadge,
              isAdmin ? styles.adminBadge : 
              item.role === 'MODERATOR' ? styles.moderatorBadge : 
              styles.userBadge
            ]}>
              <Text style={styles.roleBadgeText}>{item.role}</Text>
            </View>
            {!item.is_active && (
              <View style={styles.inactiveBadge}><Text style={styles.inactiveBadgeText}>Inactive</Text></View>
            )}
          </View>
        </View>
        
        {!isAdmin && (
          <View style={styles.userActions}>
            <TouchableOpacity 
              style={[styles.userActionButton, !item.is_active ? styles.activateButton : styles.deactivateButton]}
              onPress={() => handleToggleActive(item)}
            >
              <Ionicons name={!item.is_active ? "checkmark-circle" : "ban"} size={20} color="white" />
              <Text style={styles.userActionButtonText}>{!item.is_active ? "Activate" : "Deactivate"}</Text>
            </TouchableOpacity>
            {item.role === 'USER' && (
              <TouchableOpacity
                style={[styles.userActionButton, styles.moderatorButton]}
                onPress={() => handleRoleChange(item, 'MODERATOR')}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color="white" />
                <Text style={styles.userActionButtonText}>Make Moderator</Text>
              </TouchableOpacity>
            )}
            {item.role === 'MODERATOR' && (
              <TouchableOpacity
                style={[styles.userActionButton, styles.userRoleButton]}
                onPress={() => handleRoleChange(item, 'USER')}
              >
                <Ionicons name="person-outline" size={20} color="white" />
                <Text style={styles.userActionButtonText}>Make User</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {isAdmin && (
          <View style={styles.protectedAccountContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#673AB7" />
            <Text style={styles.protectedAccountText}>
              Admin accounts cannot be modified from this interface
            </Text>
          </View>
        )}
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
      router={router}
    />
  ), [stats, isUserManagementVisible, searchQueryUsers, router, handleUserSearch, toggleUserManagementVisibility]);

  const ListFooter = useMemo(() => (
    isUserManagementVisible ? (
      <View style={styles.footerContainer}> 
            <TouchableOpacity 
                style={styles.actionButton}
          onPress={() => router.push('./category-requests')}
            >
                <View style={[styles.actionIconContainer, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="list" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Category Requests</Text>
                <Text style={styles.actionDescription}>Approve or reject category requests</Text>
                </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
        </View>
    ) : null
  ), [isUserManagementVisible, router]);

    return (
      <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={styles.loadingIndicator} />
      ) : (
        <>
          {isUserManagementVisible ? (
        <FlatList
              key={`user-list-${contentKey}`}
              data={filteredUsers || []}
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
                    <Text style={styles.userEmptyText}>
                    {searchQueryUsers.length > 0 ? "No users match your search" : "No users found"}
                    </Text>
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
                router={router}
        />
      </ScrollView>
          )}
        </>
      )}
    </View>
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
  protectedAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  protectedAccountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
}); 