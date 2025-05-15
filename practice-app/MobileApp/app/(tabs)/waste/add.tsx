import TokenManager from '@/app/tokenManager';
import CustomAlert from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface SubCategory {
  id: number;
  name: string;
  unit: string;
  score_per_unit: string;
  category: number;
}

export default function AddWasteScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [quantity, setQuantity] = useState('');
  const [disposalDate, setDisposalDate] = useState(new Date());
  const [disposalLocation, setDisposalLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchAllPages = async (url: string) => {
    let allResults: SubCategory[] = [];
    let currentUrl: string | null = url;
    
    while (currentUrl) {
      const response = await TokenManager.authenticatedFetch(currentUrl);
      if (!response.ok) break;
      const data = await response.json();
      allResults = allResults.concat(data.results || []);
      
      // If next URL is absolute, convert it to relative by removing the base URL
      if (data.next) {
        currentUrl = data.next.replace(API_BASE_URL, '');
      } else {
        currentUrl = null;
      }
    }
    return allResults;
  };

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.CATEGORIES);
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.results || []);
        
        const allSubCategories = await fetchAllPages(API_ENDPOINTS.WASTE.SUBCATEGORIES);
        setSubCategories(allSubCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDisposalDate(selectedDate);
    }
  };

  const calculateEstimatedScore = () => {
    if (!selectedSubCategory || !quantity) return 0;
    return (parseFloat(selectedSubCategory.score_per_unit) * parseFloat(quantity)).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!selectedSubCategory || !quantity) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sub_category: selectedSubCategory.id,
          quantity: parseFloat(quantity),
          disposal_date: disposalDate.toISOString().split('T')[0],
          disposal_location: disposalLocation || undefined,
        }),
      });

      if (response.ok) {
        showAlert('Success', 'Waste log added successfully', 'success');
        router.setParams({ refresh: Date.now().toString() });
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        const error = await response.json();
        showAlert('Error', error.detail || 'Failed to add waste log');
      }
    } catch (error) {
      showAlert('Error', 'Failed to add waste log');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubCategories = selectedCategory
    ? subCategories.filter(sub => sub.category === selectedCategory.id)
    : [];

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Waste Category</ThemedText>
              <View style={styles.categoriesList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory?.id === category.id && styles.selectedCategory,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setSelectedSubCategory(null);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.categoryText,
                        selectedCategory?.id === category.id && styles.selectedCategoryText,
                      ]}
                    >
                      {category.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.requestCategoryButton}
                onPress={() => router.push('/waste/custom_category_request')}
              >
                <Ionicons name="add-circle-outline" size={24} color="#2E7D32" />
                <ThemedText style={styles.requestCategoryText}>
                  Can't find your category? Request a new one
                </ThemedText>
              </TouchableOpacity>
            </View>

            {selectedCategory && (
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Sub-Category</ThemedText>
                <View style={styles.subcategoriesList}>
                  {filteredSubCategories.map((subCategory) => (
                    <TouchableOpacity
                      key={subCategory.id}
                      style={[
                        styles.subcategoryButton,
                        selectedSubCategory?.id === subCategory.id && styles.selectedSubcategory,
                      ]}
                      onPress={() => setSelectedSubCategory(subCategory)}
                    >
                      <ThemedText
                        style={[
                          styles.subcategoryText,
                          selectedSubCategory?.id === subCategory.id && styles.selectedSubcategoryText,
                        ]}
                      >
                        {subCategory.name} ({subCategory.unit})
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Quantity ({selectedSubCategory?.unit || 'units'})</ThemedText>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="Enter quantity"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Disposal Date</ThemedText>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText>{disposalDate.toLocaleDateString()}</ThemedText>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={disposalDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Disposal Location (Optional)</ThemedText>
              <TextInput
                style={styles.input}
                value={disposalLocation}
                onChangeText={setDisposalLocation}
                placeholder="Enter disposal location"
              />
            </View>

            {selectedSubCategory && quantity && (
              <View style={styles.scoreEstimate}>
                <ThemedText style={styles.scoreLabel}>Estimated Score:</ThemedText>
                <ThemedText style={styles.scoreValue}>+{calculateEstimatedScore()} pts</ThemedText>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedSubCategory || !quantity) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedSubCategory || !quantity || isLoading}
            >
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? 'Adding...' : 'Add Waste Log'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategory: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  categoryText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  subcategoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subcategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedSubcategory: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  subcategoryText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedSubcategoryText: {
    color: 'white',
  },
  requestCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
  },
  requestCategoryText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  scoreEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E7D32',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 