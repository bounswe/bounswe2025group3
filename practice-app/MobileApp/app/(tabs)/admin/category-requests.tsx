import TokenManager from "@/app/tokenManager";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { API_ENDPOINTS } from "@/constants/api";
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

interface CategoryRequest {
  id: number;
  name: string;
  description: string | null;
  suggested_category: number | null;
  unit: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  user?: {  // Make user optional since it's not in the API response
    id: number;
    username: string;
    email: string;
  } | number;
}

export default function CategoryRequestsScreen() {
  const [requests, setRequests] = useState<CategoryRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CategoryRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.ADMIN.CATEGORY_REQUESTS);
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle paginated response format
        const requestsData = data.results || data;
        
        if (Array.isArray(requestsData)) {
          setRequests(requestsData);
          setFilteredRequests(requestsData);
        } else {
          console.error('Unexpected format for category requests data:', data);
          setRequests([]);
          setFilteredRequests([]);
        }
      } else {
        console.error('Failed to fetch category requests');
        setRequests([]);
        setFilteredRequests([]);
      }
    } catch (error) {
      console.error('Error fetching category requests:', error);
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === "") {
      setFilteredRequests(requests);
      return;
    }
    
    const filtered = requests.filter(request => 
      request.name.toLowerCase().includes(text.toLowerCase()) ||
      (request.description?.toLowerCase() || '').includes(text.toLowerCase()) ||
      (typeof request.user === 'object' && request.user?.username.toLowerCase().includes(text.toLowerCase()))
    );
    
    setFilteredRequests(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = async (requestId: number) => {
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.WASTE.ADMIN.APPROVE_CATEGORY_REQUEST(requestId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        // Update the request in our state
        const updatedRequests = requests.map(req => 
          req.id === requestId ? { ...req, status: 'approved' as const } : req
        );
        setRequests(updatedRequests);
        setFilteredRequests(
          filteredRequests.map(req => 
            req.id === requestId ? { ...req, status: 'approved' as const } : req
          )
        );
        
        Alert.alert("Success", "Category request approved successfully.");
      } else {
        Alert.alert("Error", "Failed to approve category request");
      }
    } catch (error) {
      console.error('Error approving category request:', error);
      Alert.alert("Error", "An error occurred while approving the request");
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.WASTE.ADMIN.REJECT_CATEGORY_REQUEST(requestId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        // Update the request in our state
        const updatedRequests = requests.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' as const } : req
        );
        setRequests(updatedRequests);
        setFilteredRequests(
          filteredRequests.map(req => 
            req.id === requestId ? { ...req, status: 'rejected' as const } : req
          )
        );
        
        Alert.alert("Success", "Category request rejected successfully.");
      } else {
        Alert.alert("Error", "Failed to reject category request");
      }
    } catch (error) {
      console.error('Error rejecting category request:', error);
      Alert.alert("Error", "An error occurred while rejecting the request");
    }
  };

  const renderRequestItem = ({ item }: { item: CategoryRequest }) => {
    const isPending = item.status === 'pending';
    
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <ThemedText style={styles.requestName}>{item.name}</ThemedText>
          <View style={[
            styles.statusBadge,
            item.status === 'approved' ? styles.approvedBadge : 
            item.status === 'rejected' ? styles.rejectedBadge : 
            styles.pendingBadge
          ]}>
            <ThemedText style={styles.statusBadgeText}>
              {item.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Description:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {item.description || 'No description provided'}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Unit:</ThemedText>
            <ThemedText style={styles.detailValue}>{item.unit}</ThemedText>
          </View>
          {item.user && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Requested by:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {typeof item.user === 'object' && item.user.username ? 
                  item.user.username : 
                  typeof item.user === 'number' ? 
                    `User #${item.user}` : ''}
              </ThemedText>
            </View>
          )}
        </View>
        
        {isPending && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item.id)}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Approve</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item.id)}
            >
              <Ionicons name="close-circle" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Reject</ThemedText>
            </TouchableOpacity>
          </View>
        )}
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
          placeholder="Search requests..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Request List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="list" size={50} color="#CCC" />
            <ThemedText style={styles.emptyText}>
              {searchQuery.length > 0 
                ? "No requests match your search" 
                : "No category requests found"}
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
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  pendingBadge: {
    backgroundColor: '#F57C00',
  },
  approvedBadge: {
    backgroundColor: '#2E7D32',
  },
  rejectedBadge: {
    backgroundColor: '#D32F2F',
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  requestDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
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
    width: 100,
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
  approveButton: {
    backgroundColor: '#2E7D32',
  },
  rejectButton: {
    backgroundColor: '#D32F2F',
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