import { useColors } from '@/constants/colors';
import tokenManager from '@/services/tokenManager';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { getSubcategories,getUserProfile } from '@/api/functions';

interface SubCategory {
  id: number;
  name:string;
  category: number;
  unit: string;
  description: string;
}

interface UserProfile {
  id: number;
}

const formatDateToLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AddGoalScreen() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [target, setTarget] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const colors = useColors();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { height: "7%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.primary},
    backButton: { padding: 4},
    title: { marginLeft: "12%",fontSize: 26, fontWeight: 600, color: colors.primary },
    content: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 20 },
    formGroup: { marginBottom: 36 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
    chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, },
    chipButton: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 20, backgroundColor: colors.cb1},
    chipButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary, },
    chipButtonText: { color: colors.text, fontWeight: '500' },
    chipButtonTextActive: { color: 'white' },
    descriptionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, padding: 12, backgroundColor: colors.cb1, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.primary, },
    descriptionText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, },
    buttonGroup: { flexDirection: 'row', gap: 0, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, overflow: 'hidden' },
    segmentedButton: { flex: 1, alignItems: 'center', paddingVertical: 14, backgroundColor: colors.cb1, borderRightWidth: 1, borderRightColor: colors.primary, },
    segmentedButtonActive: { backgroundColor: colors.primary },
    segmentedButtonText: { color: colors.text, fontWeight: '500' },
    segmentedButtonTextActive: { color: 'white' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, height: 50, gap: 10, },
    inputText: { fontSize: 16, color: colors.text },
    input: { flex: 1, fontSize: 16, color: colors.text, height: '100%', },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cb1, padding: 12, borderRadius: 12, gap: 10, marginTop: -12, marginBottom: 24, },
    infoText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, },
    submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', height: 52, marginTop: 16, marginBottom: "55%" },
    submitButtonDisabled: { backgroundColor: colors.cb4, },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
    requestCategoryButton: { backgroundColor: colors.cb1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 8, marginTop: 20, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', },
    requestCategoryText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const [subCatData, userData] = await Promise.all([
          getSubcategories(),
          getUserProfile()
        ]);
        setSubcategories(subCatData);
        if(userData) setUserProfile(userData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubCategorySelect = (subcategory: SubCategory) => {
    setSelectedSubCategory(subcategory);
  };

  const calculateEndDate = (start: Date, time: 'daily' | 'weekly' | 'monthly'): Date => {
    const end = new Date(start);
    switch (time) {
      case 'daily': end.setDate(end.getDate() + 1); break;
      case 'weekly': end.setDate(end.getDate() + 7); break;
      case 'monthly': end.setMonth(end.getMonth() + 1); break;
    }
    return end;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowDatePicker(false);
    setStartDate(currentDate);
  };

  const handleSubmit = async () => {
    if (!selectedSubCategory || !target || !userProfile) {
        Alert.alert('Missing Information', 'Please complete all fields to create a goal.');
        return;
    }
    setIsLoading(true);
    try {
      const response = await tokenManager.authenticatedFetch("/api/v1/goals/goals/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userProfile.id,
          category_id: selectedSubCategory.id,
          timeframe,
          target: parseFloat(target),
          start_date: formatDateToLocal(startDate),
          status: 'pending',
        }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Your new goal has been created!');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const targetUnit = selectedSubCategory ? `(${selectedSubCategory.unit})` : '';

  if (isDataLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Goal</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select a Category</Text>
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

          <TouchableOpacity style={styles.requestCategoryButton} onPress={() => router.push("/custom_category_request")}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.requestCategoryText}>Can't find your item? Request a new one</Text>
          </TouchableOpacity>
        </View>
        
        {selectedSubCategory && (
            <>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Set a Timeframe</Text>
                    <View style={styles.buttonGroup}>
                        {(['daily', 'weekly', 'monthly'] as const).map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.segmentedButton, timeframe === option && styles.segmentedButtonActive]}
                            onPress={() => setTimeframe(option)}
                        >
                            <Text style={[styles.segmentedButtonText, timeframe === option && styles.segmentedButtonTextActive]}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                        </TouchableOpacity>
                        ))}
                    </View>
                </View>
                
                <View style={[styles.formGroup, {marginBottom:16}]}>
                    <Text style={styles.label}>Select a Start Date</Text>
                    <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Text style={styles.inputText}>{startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={startDate} mode="date" display="spinner" onChange={handleDateChange} minimumDate={new Date()}
                    />
                )}

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    <Text style={styles.infoText}>
                        Your goal will automatically end on <Text style={{fontWeight: 'bold'}}>{calculateEndDate(startDate, timeframe).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>.
                    </Text>
                </View>

                <View style={[styles.formGroup, {marginBottom: 16}]}>
                    <Text style={styles.label}>Set a Target Amount {targetUnit}</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="scale-outline" size={20} color={colors.primary} />
                        <TextInput 
                            style={styles.input} 
                            value={target} 
                            onChangeText={setTarget} 
                            keyboardType="decimal-pad" 
                            placeholder={`e.g., 5`} 
                            placeholderTextColor={colors.textSecondary} 
                        />
                    </View>
                </View>
            </>
        )}

        <TouchableOpacity style={[styles.submitButton, (!selectedSubCategory || !target) && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={!selectedSubCategory || !target || isLoading}>
          {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Create Goal</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
