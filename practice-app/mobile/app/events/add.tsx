import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, PermissionsAndroid, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { createEvent } from '@/api/events';
import { useTranslation } from 'react-i18next';
import ImagePicker from 'react-native-image-crop-picker';

const formatDateTimeToISO = (date: Date): string => {
  return date.toISOString();
};

export default function AddEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colors = useColors();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { height: "7%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.primary},
    backButton: { padding: 4},
    title: { marginLeft: "12%",fontSize: 26, fontWeight: "600", color: colors.primary },
    content: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 20 },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
    inputContainer: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, minHeight: 50, justifyContent: 'center' },
    textInput: { fontSize: 16, color: colors.text, minHeight: 50 },
    textArea: { fontSize: 16, color: colors.text, minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
    dateInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, height: 50, gap: 10 },
    dateInputText: { fontSize: 16, color: colors.text, flex: 1 },
    imageContainer: { marginTop: 8, alignItems: 'center' },
    imagePreview: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: colors.cb1 },
    imagePlaceholder: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: colors.cb1, borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    imageButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    imageButtonText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    removeImageButton: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.error, borderRadius: 8, alignSelf: 'center' },
    removeImageButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', height: 52, marginTop: 16, marginBottom: "55%" },
    submitButtonDisabled: { backgroundColor: colors.cb4 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  });

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (event, selectedDate) => {
          if (event.type !== 'dismissed' && selectedDate) {
            const newDate = selectedDate;
            DateTimePickerAndroid.open({
              value: newDate,
              mode: 'time',
              is24Hour: false,
              onChange: (timeEvent, selectedTime) => {
                if (timeEvent.type !== 'dismissed' && selectedTime) {
                  setDate(selectedTime);
                }
              },
            });
          }
        },
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      const currentDate = selectedDate || date;
      setShowDatePicker(false);
      setDate(currentDate);
    }
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    
    try {
      // Android 13+ uses READ_MEDIA_IMAGES, older versions use READ_EXTERNAL_STORAGE
      const permission = Platform.Version >= 33 
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      
      const granted = await PermissionsAndroid.request(permission, {
        title: 'Galeri İzni Gerekli',
        message: 'Fotoğraf seçebilmek için galeri erişim izni gereklidir.',
        buttonNeutral: 'Daha Sonra Sor',
        buttonNegative: 'İptal',
        buttonPositive: 'Tamam',
      });
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const pickImage = async () => {
    // Request permission first on Android
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni vermeniz gerekmektedir.');
      return;
    }

    try {
      const image = await ImagePicker.openPicker({
        width: 1280,
        height: 720,
        cropping: true,
        mediaType: 'photo',
        cropperCircleOverlay: false,
        aspectRatio: { width: 16, height: 9 },
        
        cropperToolbarTitle: 'Fotoğrafı Düzenle',
        cropperToolbarColor: colors.cb1,       
        cropperStatusBarColor: colors.primary,     
        cropperToolbarWidgetColor: '#FFFFFF',      
        cropperActiveWidgetColor: colors.primary,  
        freeStyleCropEnabled: false,
      });

      setImageUri(image.path);

    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Hata', 'Fotoğraf seçilemedi: ' + error.message);
      }
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      await createEvent({
        title,
        description,
        location,
        date: formatDateTimeToISO(date),
        image: imageUri || undefined,
      });
      Alert.alert("Success", "Event created successfully!");
      router.back();
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create event.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Event</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              value={title} 
              onChangeText={setTitle} 
              placeholder="Enter event title" 
              placeholderTextColor={colors.textSecondary} 
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={[styles.textInput, styles.textArea]} 
              value={description} 
              onChangeText={setDescription} 
              placeholder="Enter event description" 
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location *</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              value={location} 
              onChangeText={setLocation} 
              placeholder="Enter event location" 
              placeholderTextColor={colors.textSecondary} 
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date & Time *</Text>
          <TouchableOpacity style={styles.dateInputContainer} onPress={openDatePicker}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dateInputText}>
              {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' '}
              {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' && showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="spinner"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Image (optional)</Text>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Text style={styles.removeImageButtonText}>Remove Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
              <Ionicons name="image-outline" size={48} color={colors.primary} />
              <View style={styles.imageButton}>
                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                <Text style={styles.imageButtonText}>Select Image</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, (!title || !description || !location) && styles.submitButtonDisabled]} 
          onPress={handleSubmit} 
          disabled={!title || !description || !location || isLoading}
        >
          {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Create Event</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}