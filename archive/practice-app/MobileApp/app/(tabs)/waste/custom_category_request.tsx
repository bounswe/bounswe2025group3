import TokenManager from '@/app/tokenManager';
import CustomAlert from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.CATEGORY_REQUEST, {
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
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Request New Category</ThemedText>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={24} color="#2E7D32" />
              <ThemedText style={styles.infoText}>
                Can't find the waste category you're looking for? Request a new one and our team will review it.
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Category Name *</ThemedText>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Electronic Waste"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description (Optional)</ThemedText>
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
              <ThemedText style={styles.label}>Unit of Measurement *</ThemedText>
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
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </ThemedText>
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
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    color: '#2E7D32',
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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