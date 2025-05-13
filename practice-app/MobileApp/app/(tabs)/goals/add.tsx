import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export default function AddGoalScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [goalType, setGoalType] = useState<'reduction' | 'recycling'>('reduction');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [target, setTarget] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

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

  const fetchCategories = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.CATEGORIES);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.results);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchCategories();
  }, []);

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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleTimeframeChange = (newTimeframe: 'daily' | 'weekly' | 'monthly') => {
    setTimeframe(newTimeframe);
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !target || !userProfile) return;

    const endDate = calculateEndDate(startDate, timeframe);

    setIsLoading(true);
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.GOALS.CREATE,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: userProfile.id,
            category_id: selectedCategory,
            goal_type: goalType,
            timeframe,
            target: parseFloat(target),
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            status: 'pending'
          }),
        }
      );

      if (response.ok) {
        router.back();
      } else {
        const errorData = await response.json();
        console.error('Error creating goal:', errorData);
        Alert.alert('Error', errorData.detail || 'Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCategories) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Create New Goal</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <View style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <ThemedText
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Goal Type</ThemedText>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  goalType === 'reduction' && styles.typeButtonActive,
                ]}
                onPress={() => setGoalType('reduction')}
              >
                <Ionicons
                  name="trending-down"
                  size={20}
                  color={goalType === 'reduction' ? 'white' : '#2E7D32'}
                />
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    goalType === 'reduction' && styles.typeButtonTextActive,
                  ]}
                >
                  Reduction
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  goalType === 'recycling' && styles.typeButtonActive,
                ]}
                onPress={() => setGoalType('recycling')}
              >
                <Ionicons
                  name="reload"
                  size={20}
                  color={goalType === 'recycling' ? 'white' : '#2E7D32'}
                />
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    goalType === 'recycling' && styles.typeButtonTextActive,
                  ]}
                >
                  Recycling
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Timeframe</ThemedText>
            <View style={styles.buttonGroup}>
              {(['daily', 'weekly', 'monthly'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.timeframeButton,
                    timeframe === option && styles.timeframeButtonActive,
                  ]}
                  onPress={() => handleTimeframeChange(option)}
                >
                  <ThemedText
                    style={[
                      styles.timeframeButtonText,
                      timeframe === option && styles.timeframeButtonTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <ThemedText style={styles.timeframeInfo}>
              End date will be automatically set to {
                calculateEndDate(startDate, timeframe).toLocaleDateString()
              }
            </ThemedText>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Start Date</ThemedText>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{startDate.toLocaleDateString()}</ThemedText>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Target Amount (kg)</ThemedText>
            <TextInput
              style={styles.input}
              value={target}
              onChangeText={setTarget}
              keyboardType="decimal-pad"
              placeholder="Enter target amount"
              placeholderTextColor="#666"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedCategory || !target) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedCategory || !target || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Create Goal</ThemedText>
          )}
        </TouchableOpacity>
      </View>
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  categoryButtonActive: {
    backgroundColor: '#2E7D32',
  },
  categoryButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#2E7D32',
  },
  typeButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  timeframeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
  },
  timeframeButtonActive: {
    backgroundColor: '#2E7D32',
  },
  timeframeButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  timeframeButtonTextActive: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  timeframeInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 