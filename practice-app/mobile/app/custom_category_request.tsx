import { useColors } from '@/constants/colors';
import tokenManager from '@/services/tokenManager';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_ENDPOINTS } from '@/constants/api';

const CustomAlert = ({ visible, title, message, type, onClose }: any) => {
    if (!visible) return null;
    return (
        <View style={{ position: 'absolute', top: 50, left: 20, right: 20, padding: 20, backgroundColor: type === 'success' ? 'green' : 'red', borderRadius: 10 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{title}</Text>
            <Text style={{ color: 'white' }}>{message}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ color: 'white', marginTop: 10 }}>Close</Text></TouchableOpacity>
        </View>
    );
};

export default function CustomCategoryRequestScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const router = useRouter();
  const colors = useColors();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: { height: "7%", paddingHorizontal: "4%", paddingTop: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 600, color: colors.text, marginLeft: 12 },
    headerSpacer: { flex: 1 },
    content: { flex: 1, padding: 20 },
    form: { gap: 24 },
    infoBox: { flexDirection: 'row', backgroundColor: colors.cb1, padding: 16, borderRadius: 12, gap: 12, marginBottom: 8 },
    infoText: { flex: 1, color: colors.primary, fontSize: 14, lineHeight: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 16, fontWeight: '500', color: colors.text },
    input: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.borders, borderRadius: 8, padding: 12, fontSize: 16, color: colors.text },
    textArea: { height: 100, textAlignVertical: 'top' },
    submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    submitButtonDisabled: { backgroundColor: colors.cb4 },
    submitButtonText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleSubmit = async () => {
    if (!name || !unit) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.CATEGORY_REQUEST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          unit,
        }),
      });

      if (response.ok) {
        showAlert('Success', 'Category request submitted successfully', 'success');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        const error = await response.json();
        showAlert('Error', error.detail || 'Failed to submit category request');
      }
    } catch (error) {
      showAlert('Error', 'Failed to submit category request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request New Category</Text>
        <View style={styles.headerSpacer} />
      </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                Can't find the waste category you're looking for? Request a new one and our team will review it.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Electronic Waste"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe this waste category..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Unit of Measurement *</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="e.g., kg, pieces, liters"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!name || !unit || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!name || !unit || isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}