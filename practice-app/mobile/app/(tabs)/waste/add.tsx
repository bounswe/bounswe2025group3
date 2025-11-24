import { useColors } from '@/constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { getSubcategories, createWasteLog, Subcategory } from '@/api/waste';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

const formatDateToLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export default function AddWasteLogScreen() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Subcategory | null>(null);
  const [quantity, setQuantity] = useState('');
  const [disposalDate, setDisposalDate] = useState(new Date());
  const [disposalLocation, setDisposalLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const router = useRouter();
  const colors = useColors();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { height: "7%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.primary },
    backButton: { padding: 4 },
    title: { marginLeft: "12%", fontSize: 26, fontWeight: '600', color: colors.primary },
    content: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 20 },
    formGroup: { marginBottom: 36 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
    chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, },
    chipButton: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 20, backgroundColor: colors.cb1 },
    chipButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary, },
    chipButtonText: { color: colors.text, fontWeight: '500' },
    chipButtonTextActive: { color: 'white' },
    descriptionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 16, padding: 12, backgroundColor: colors.cb1, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.primary, },
    descriptionText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, height: 50, gap: 10, },
    inputText: { fontSize: 16, color: colors.text },
    input: { flex: 1, fontSize: 16, color: colors.text, height: '100%', },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cb1, padding: 12, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: colors.borders, marginTop: 12, marginBottom: 24, },
    infoText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20, },
    requestCategoryButton: { backgroundColor: colors.cb1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 8, marginTop: 20, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', },
    requestCategoryText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', height: 52, marginTop: 16, marginBottom: "20%" },
    submitButtonDisabled: { backgroundColor: colors.cb4, },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
    imagePickerContainer: { alignItems: 'center', justifyContent: 'center', height: 200, backgroundColor: colors.cb1, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', marginTop: 8, overflow: 'hidden' },
    imagePreview: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center', gap: 8 },
    imagePlaceholderText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    removeImageButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const subCatData = await getSubcategories();
        setSubcategories(subCatData);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubCategorySelect = (subcategory: Subcategory) => {
    setSelectedSubCategory(subcategory);
    setQuantity('');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || disposalDate;
    setShowDatePicker(false);
    setDisposalDate(currentDate);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    if (!selectedSubCategory || !quantity) {
      Alert.alert(t("waste.missing_info_title"), t("waste.missing_info_message"));
      return;
    }
    setIsSubmitting(true);
    try {
      await createWasteLog({
        sub_category: selectedSubCategory.id,
        quantity: parseFloat(quantity),
        disposal_date: formatDateToLocal(disposalDate),
        disposal_location: disposalLocation || undefined,
        disposal_photo: selectedImage || undefined,
      });
      Alert.alert(t("waste.success_title"), t("waste.log_added_success"));
      router.back();
    } catch (error) {
      console.error('Error adding waste log:', error);
      Alert.alert(t("waste.error_title"), t("waste.log_add_failed"));
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
        <Text style={styles.title}>{t("waste.add_new_entry")}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t("waste.select_item")}</Text>
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
            <Text style={styles.requestCategoryText}>{t("waste.request_new_item")}</Text>
          </TouchableOpacity>
        </View>

        {selectedSubCategory && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t("waste.enter_amount")} {quantityUnit}</Text>
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
              <Text style={styles.label}>{t("waste.disposal_date")}</Text>
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

            <View style={[styles.formGroup, { marginBottom: 16 }]}>
              <Text style={styles.label}>{t("waste.disposal_location")}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  value={disposalLocation}
                  onChangeText={setDisposalLocation}
                  placeholder={t("waste.location_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t("waste.add_photo") || "Add Photo"}</Text>
              <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                {selectedImage ? (
                  <>
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} contentFit="cover" />
                    <TouchableOpacity style={styles.removeImageButton} onPress={(e) => { e.stopPropagation(); removeImage(); }}>
                      <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={32} color={colors.primary} />
                    <Text style={styles.imagePlaceholderText}>{t("waste.tap_to_select_photo") || "Tap to select photo"}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {quantity && (
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="star-four-points-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  {t("waste.you_will_get")} <Text style={{ fontWeight: 'bold' }}>+{calculateEstimatedScore()} {t("leaderboard.pts")}</Text>
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
          {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>{t("waste.submit")}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}