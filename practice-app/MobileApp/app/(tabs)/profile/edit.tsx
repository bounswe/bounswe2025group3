import TokenManager from '@/app/tokenManager';
import CustomAlert from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
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

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  date_joined: string;
  notifications_enabled: boolean;
}

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          bio: profile.bio,
          city: profile.city,
          country: profile.country,
          notifications_enabled: profile.notifications_enabled,
        }),
      });

      if (response.ok) {
        showAlert('Success', 'Profile updated successfully', 'success');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        const error = await response.json();
        showAlert('Error', error.detail || 'Failed to update profile');
      }
    } catch (error) {
      showAlert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
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
        <ThemedView style={styles.container}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#2E7D32" />
              </TouchableOpacity>
              <ThemedText style={styles.title}>Edit Profile</ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>First Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={profile.first_name}
                  onChangeText={(text) => setProfile({ ...profile, first_name: text })}
                  placeholder="Enter first name"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Last Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={profile.last_name}
                  onChangeText={(text) => setProfile({ ...profile, last_name: text })}
                  placeholder="Enter last name"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Bio</ThemedText>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={profile.bio || ''}
                  onChangeText={(text) => setProfile({ ...profile, bio: text })}
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>City</ThemedText>
                <TextInput
                  style={styles.input}
                  value={profile.city || ''}
                  onChangeText={(text) => setProfile({ ...profile, city: text })}
                  placeholder="Enter your city"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Country</ThemedText>
                <TextInput
                  style={styles.input}
                  value={profile.country || ''}
                  onChangeText={(text) => setProfile({ ...profile, country: text })}
                  placeholder="Enter your country"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <ThemedText style={styles.submitButtonText}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
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
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 