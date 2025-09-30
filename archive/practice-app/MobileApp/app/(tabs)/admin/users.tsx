import TokenManager from "@/app/tokenManager";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { API_ENDPOINTS, UserProfile } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  View 
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

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.USERS);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.results);
        setFilteredUsers(data.results);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === "") {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(text.toLowerCase()) ||
      user.email.toLowerCase().includes(text.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(text.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(text.toLowerCase()))
    );
    
    setFilteredUsers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleToggleActive = async (user: ExtendedUserProfile) => {
    try {
      const newStatus = !user.is_active;
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.SET_ACTIVE_STATUS(user.id),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: newStatus }),
        }
      );
      
      if (response.ok) {
        // Update the user in our state
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, is_active: newStatus } : u
        );
        setUsers(updatedUsers);
        setFilteredUsers(
          filteredUsers.map(u => 
            u.id === user.id ? { ...u, is_active: newStatus } : u
          )
        );
        
        Alert.alert(
          "Success", 
          `User ${user.username} has been ${newStatus ? 'activated' : 'deactivated'}.`
        );
      } else {
        Alert.alert("Error", "Failed to update user status");
      }
    } catch (error) {
      console.error('Error toggling user active status:', error);
      Alert.alert("Error", "An error occurred while updating user status");
    }
  };

  const handleRoleChange = async (user: ExtendedUserProfile, newRole: 'USER' | 'MODERATOR') => {
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.USER.SET_USER_ROLE(user.id), // Assuming this endpoint exists or will be created
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        const updatedUsers = users.map(u =>
          u.id === user.id ? { ...u, role: newRole } : u
        );
        setUsers(updatedUsers);
        setFilteredUsers(
          filteredUsers.map(u =>
            u.id === user.id ? { ...u, role: newRole } : u
          )
        );
        Alert.alert(
          "Success",
          `User ${user.username}'s role has been updated to ${newRole}.`
        );
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
              <View style={styles.inactiveBadge}>
                <ThemedText style={styles.inactiveBadgeText}>Inactive</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.userActions}>
          <TouchableOpacity 
            style={[styles.actionButton, !item.is_active ? styles.activateButton : styles.deactivateButton]}
            onPress={() => handleToggleActive(item)}
          >
            <Ionicons 
              name={!item.is_active ? "checkmark-circle" : "ban"} 
              size={20} 
              color="white" 
            />
            <ThemedText style={styles.actionButtonText}>
              {!item.is_active ? "Activate" : "Deactivate"}
            </ThemedText>
          </TouchableOpacity>

          {item.role === 'USER' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.moderatorButton]}
              onPress={() => handleRoleChange(item, 'MODERATOR')}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Make Moderator</ThemedText>
            </TouchableOpacity>
          )}

          {item.role === 'MODERATOR' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.userButton]}
              onPress={() => handleRoleChange(item, 'USER')}
            >
              <Ionicons name="person-outline" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Make User</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
      
      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={50} color="#CCC" />
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
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  adminBadge: {
    backgroundColor: '#D32F2F',
  },
  moderatorBadge: {
    backgroundColor: '#FF9800',
  },
  userBadge: {
    backgroundColor: '#2E7D32',
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
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  activateButton: {
    backgroundColor: '#2E7D32',
  },
  deactivateButton: {
    backgroundColor: '#D32F2F',
  },
  moderatorButton: {
    backgroundColor: '#FF9800',
  },
  userButton: {
    backgroundColor: '#0288D1',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
}); 