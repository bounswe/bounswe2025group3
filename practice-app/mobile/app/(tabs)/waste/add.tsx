import { useColors } from '@/constants/colors';
import tokenManager from '@/services/tokenManager';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

interface SubCategory {
  id: number;
  name: string;
  unit: string;
  score_per_unit: string;
  category: number;
  description: string;
}

const fetchAllPages = async <T,>(initialUrl: string): Promise<T[]> => {
    let results: T[] = [];
    let nextUrl: string | null = initialUrl;
    while (nextUrl) {
        try {
            const response = await tokenManager.authenticatedFetch(nextUrl);
            if (!response.ok) { break; }
            const data = await response.json();
            results = results.concat(data.results);
            if (data.next) {
                const nextURLObject = new URL(data.next);
                const relativePath = nextURLObject.pathname.startsWith('/api') ? nextURLObject.pathname.substring(4) : nextURLObject.pathname;
                nextUrl = relativePath + nextURLObject.search;
            } else {
                nextUrl = null;
            }
        } catch (error) {
            console.error('Error during pagination fetch:', error);
            break; 
        }
    }
    return results;
};

export default function AddWasteLogScreen() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [quantity, setQuantity] = useState('');
  const [disposalDate, setDisposalDate] = useState(new Date());
  const [disposalLocation, setDisposalLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const router = useRouter();
  const colors = useColors();

  const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background },
      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
      header: { height: "7%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.primary},
      backButton: { padding: 4},
      title: { marginLeft: "12%", fontSize: 26, fontWeight: '600', color: colors.primary },
      content: { flex: 1, backgroundColor: colors.background },
      contentContainer: { padding: 20 },
      formGroup: { marginBottom: 36 },
      label: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
      chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, },
      chipButton: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 20, backgroundColor: colors.background},
      chipButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary, },
      chipButtonText: { color: colors.text, fontWeight: '500' },
      chipButtonTextActive: { color: 'white' },
      descriptionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 16, padding: 12, backgroundColor: colors.cb1, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.primary, },
      descriptionText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, },
      inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, height: 50, gap: 10, },
      inputText: { fontSize: 16, color: colors.text },
      input: { flex: 1, fontSize: 16, color: colors.text, height: '100%', },
      infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cb1, padding: 12, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: colors.borders, marginTop: 12, marginBottom: 24,},
      infoText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20, },
      requestCategoryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 8, marginTop: 20, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', },
      requestCategoryText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
      submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', height: 52, marginTop: 16, marginBottom: "20%" },
      submitButtonDisabled: { backgroundColor: colors.borders, },
      submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const subCatData = await fetchAllPages<SubCategory>("/v1/waste/subcategories/");
        setSubcategories(subCatData);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubCategorySelect = (subcategory: SubCategory) => {
    setSelectedSubCategory(subcategory);
    setQuantity(''); 
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || disposalDate;
    setShowDatePicker(false);
    setDisposalDate(currentDate);
  };

  const handleSubmit = async () => {
    if (!selectedSubCategory || !quantity) {
        Alert.alert('Missing Information', 'Please select an item and enter the quantity.');
        return;
    }
    setIsSubmitting(true);
    try {
        const response = await tokenManager.authenticatedFetch("/v1/waste/logs/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sub_category: selectedSubCategory.id,
                quantity: parseFloat(quantity),
                date_logged: new Date().toISOString().split('T')[0],
                disposal_date: disposalDate.toISOString().split('T')[0],
                disposal_location: disposalLocation || undefined,
            }),
        });
        if (response.ok) {
            Alert.alert('Success', 'Waste log added successfully!');
            router.back();
        } else {
            const errorData = await response.json();
            Alert.alert('Error', errorData.detail || 'Failed to add waste log');
        }
    } catch (error) {
        console.error('Error adding waste log:', error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const quantityUnit = selectedSubCategory ? `(${selectedSubCategory.unit})` : '';
  const calculateEstimatedScore = () => {
    if (!selectedSubCategory || !quantity) return '0.00';
    return (parseFloat(selectedSubCategory.score_per_unit) * parseFloat(quantity)).toFixed(2);
  };

  if (isDataLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Entry</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select an Item</Text>
          <View style={styles.chipList}>
            {subcategories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chipButton, selectedSubCategory?.id === cat.id && styles.chipButtonActive]}
                onPress={() => handleSubCategorySelect(cat)}
              >
                <Text style={[styles.chipButtonText, selectedSubCategory?.id === cat.id && styles.chipButtonTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedSubCategory?.description && (
            <View style={styles.descriptionBox}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.descriptionText}>{selectedSubCategory.description}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.requestCategoryButton} onPress={() => router.push('/waste/custom_category_request')}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.requestCategoryText}>Can't find your item? Request a new one</Text>
          </TouchableOpacity>
        </View>

        {selectedSubCategory && (
            <>
                {/* --- Miktar Girişi --- */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Enter Amount {quantityUnit}</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="scale-outline" size={20} color={colors.primary} />
                        <TextInput 
                            style={styles.input} 
                            value={quantity} 
                            onChangeText={setQuantity} 
                            keyboardType="decimal-pad" 
                            placeholder={`e.g., 5`} 
                            placeholderTextColor={colors.textSecondary} 
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Disposal Date</Text>
                    <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Text style={styles.inputText}>{disposalDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={disposalDate} mode="date" display="spinner" onChange={handleDateChange} maximumDate={new Date()}
                    />
                )}
                
                <View style={[styles.formGroup, {marginBottom: 16}]}>
                    <Text style={styles.label}>Disposal Location (Optional)</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="location-outline" size={20} color={colors.primary} />
                        <TextInput 
                            style={styles.input} 
                            value={disposalLocation} 
                            onChangeText={setDisposalLocation} 
                            placeholder="e.g., Recycling Center" 
                            placeholderTextColor={colors.textSecondary} 
                        />
                    </View>
                </View>

                {quantity && (
                    <View style={styles.infoBox}>
                        <Ionicons name="star-outline" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>
                            You will get : <Text style={{fontWeight: 'bold'}}>+{calculateEstimatedScore()} pts</Text>
                        </Text>
                    </View>
                )}
            </>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, (!selectedSubCategory || !quantity) && styles.submitButtonDisabled]} 
          onPress={handleSubmit} 
          disabled={!selectedSubCategory || !quantity || isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Submit</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}