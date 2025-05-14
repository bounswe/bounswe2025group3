import TokenManager from '@/app/tokenManager';
import CustomAlert from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
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

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      showAlert('Error', 'New password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // First verify the current password
      const verifyResponse = await TokenManager.authenticatedFetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TokenManager.getEmail(),
          password: currentPassword,
        }),
      });

      if (!verifyResponse.ok) {
        showAlert('Error', 'Current password is incorrect');
        setIsLoading(false);
        return;
      }

      // If current password is correct, proceed with password change
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.AUTH.PASSWORD_CHANGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password1: newPassword,
          new_password2: confirmPassword,
          old_password: currentPassword,
        }),
      });

      if (response.ok) {
        showAlert('Success', 'Password changed successfully', 'success');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        const error = await response.json();
        showAlert('Error', error.detail || 'Failed to change password');
      }
    } catch (error) {
      showAlert('Error', 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Change Password</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Current Password</ThemedText>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPassword.current}
                placeholder="Enter current password"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('current')}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword.current ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>New Password</ThemedText>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword.new}
                placeholder="Enter new password"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('new')}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword.new ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Confirm New Password</ThemedText>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword.confirm}
                placeholder="Confirm new password"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('confirm')}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword.confirm ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <ThemedText style={styles.submitButtonText}>
              {isLoading ? 'Changing Password...' : 'Change Password'}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
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
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
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