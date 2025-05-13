import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
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

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState('');
  const [editTimeframe, setEditTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [editStartDate, setEditStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{ id: number } | null>(null);

  const fetchUserProfile = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchGoalDetails = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.GOALS.BY_ID(id)
      );
      if (response.ok) {
        const data = await response.json();
        setGoal(data);
        setEditTarget(data.target.toString());
        setEditTimeframe(data.timeframe);
        setEditStartDate(new Date(data.start_date));
      }
    } catch (error) {
      console.error('Error fetching goal details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchGoalDetails();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await TokenManager.authenticatedFetch(
                API_ENDPOINTS.GOALS.BY_ID(id),
                {
                  method: 'DELETE',
                }
              );
              if (response.ok) {
                router.back();
              }
            } catch (error) {
              console.error('Error deleting goal:', error);
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditStartDate(selectedDate);
    }
  };

  // Calculate end date based on start date and timeframe
  const calculateEndDate = (start: Date, time: 'daily' | 'weekly' | 'monthly'): Date => {
    const end = new Date(start);
    switch (time) {
      case 'daily':
        end.setDate(end.getDate() + 1);
        break;
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        end.setDate(end.getDate() + 30);
        break;
    }
    return end;
  };

  const handleTimeframeChange = (newTimeframe: 'daily' | 'weekly' | 'monthly') => {
    setEditTimeframe(newTimeframe);
  };

  const handleEdit = async () => {
    if (!editTarget || !goal || !userProfile) return;
    
    // Check if goal has already started
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(editStartDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      Alert.alert('Error', 'Cannot edit a goal that has already started');
      return;
    }

    const endDate = calculateEndDate(editStartDate, editTimeframe);
    
    setEditLoading(true);
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.GOALS.BY_ID(id),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: userProfile.id,
            category_id: goal.category.id,
            goal_type: goal.goal_type,
            timeframe: editTimeframe,
            target: parseFloat(editTarget),
            start_date: editStartDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          }),
        }
      );

      const responseText = await response.text();
      console.log('Server response:', responseText);

      if (response.ok) {
        setShowEdit(false);
        fetchGoalDetails();
      } else {
        try {
          const errorData = JSON.parse(responseText);
          Alert.alert('Error', errorData.detail || 'Failed to update goal');
        } catch (e) {
          Alert.alert('Error', 'Failed to update goal. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </ThemedView>
    );
  }

  if (!goal) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Goal not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Goal Details</ThemedText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setShowEdit(true)} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.goalTypeContainer}>
              <Ionicons
                name={goal.goal_type === 'reduction' ? 'trending-down' : 'reload'}
                size={24}
                color="#2E7D32"
              />
              <ThemedText style={styles.goalType}>
                {goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}
              </ThemedText>
            </View>
            <View style={styles.timeframeContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <ThemedText style={styles.timeframe}>
                {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.categoryName}>{goal.category.name}</ThemedText>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressLabel}>Progress</ThemedText>
              <ThemedText style={styles.progressValue}>
                {goal.progress.toFixed(1)} / {goal.target.toFixed(1)} kg
              </ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(goal.progress / goal.target) * 100}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Status</ThemedText>
              <ThemedText style={styles.detailValue}>
                {goal.is_complete ? 'Completed' : 'In Progress'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Created</ThemedText>
              <ThemedText style={styles.detailValue}>
                {new Date(goal.created_at).toLocaleDateString()}
              </ThemedText>
            </View>
            {goal.start_date && (
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Start Date</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {new Date(goal.start_date).toLocaleDateString()}
                </ThemedText>
              </View>
            )}
            {goal.end_date && (
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>End Date</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {new Date(goal.end_date).toLocaleDateString()}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Edit Goal</ThemedText>
            
            <ThemedText style={styles.modalLabel}>Start Date</ThemedText>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{editStartDate.toLocaleDateString()}</ThemedText>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={editStartDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <ThemedText style={styles.modalLabel}>Timeframe</ThemedText>
            <View style={styles.timeframeButtons}>
              {['daily', 'weekly', 'monthly'].map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[styles.timeframeBtn, editTimeframe === tf && styles.timeframeBtnActive]}
                  onPress={() => handleTimeframeChange(tf as 'daily' | 'weekly' | 'monthly')}
                >
                  <ThemedText style={styles.timeframeBtnText}>{tf.charAt(0).toUpperCase() + tf.slice(1)}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <ThemedText style={styles.timeframeInfo}>
              End date will be automatically set to {
                calculateEndDate(editStartDate, editTimeframe).toLocaleDateString()
              }
            </ThemedText>

            <ThemedText style={styles.modalLabel}>Target (kg)</ThemedText>
            <TextInput
              style={styles.input}
              value={editTarget}
              onChangeText={setEditTarget}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowEdit(false)} style={styles.cancelBtn}>
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={styles.saveBtn} disabled={editLoading}>
                <ThemedText>{editLoading ? 'Saving...' : 'Save'}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  timeframeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeframe: {
    fontSize: 16,
    color: '#666',
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  timeframeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
  },
  timeframeBtnActive: {
    borderColor: '#2E7D32',
  },
  timeframeBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelBtn: {
    padding: 10,
  },
  saveBtn: {
    padding: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  timeframeInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 