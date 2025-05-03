import { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { sharedStyles } from '@/components/ui/styles';
import CustomAlert from '@/components/CustomAlert';
import { useRouter, useNavigation } from 'expo-router';

export default function ResetCodeScreen() {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const router = useRouter();
  const navigation = useNavigation();

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleResetPassword = () => {
    if (!code || !newPassword || !confirmPassword) {
      showAlert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Error", "Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showAlert(
        "Error",
        "Password must be at least 8 characters long and contain at least one number."
      );
      return;
    }

    // TODO: Implement API call to reset password
    // Example API call structure:
    /*
    try {
      const response = await fetch('YOUR_API_ENDPOINT/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          newPassword,
          confirmPassword 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle successful password reset
        showAlert("Success", "Password reset successfully", "success");
        navigation.reset({
          index: 0,
          routes: [{ name: '(welcome)/login' as never }],
        });
      } else {
        // Handle error
        showAlert("Error", "Failed to reset password. Please try again.");
      }
    } catch (error) {
      showAlert("Error", "An error occurred while resetting password");
    }
    */

    // Temporary success for testing
    showAlert("Success", "Password reset successfully", "success");
    setTimeout(() => {
      setAlertVisible(false);
      navigation.reset({
        index: 1,
        routes: [
          { name: 'index' as never },
          { name: 'login' as never },
        ],
      });
      }, 900);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <TouchableOpacity onPress={() => router.back()} style={sharedStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <View style={styles.innerContent}>
          <ThemedText style={styles.title}>Reset Password</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter the code sent to your email and your new password.
          </ThemedText>

          <View style={sharedStyles.form}>
            <View style={sharedStyles.inputContainer}>
              <Ionicons name="key-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
              <TextInput
                style={sharedStyles.input}
                placeholder="Reset Code"
                placeholderTextColor="#666"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={sharedStyles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
              <TextInput
                style={sharedStyles.input}
                placeholder="New Password"
                placeholderTextColor="#666"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={sharedStyles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            <View style={sharedStyles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
              <TextInput
                style={sharedStyles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={sharedStyles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={sharedStyles.button} 
              onPress={handleResetPassword}
              activeOpacity={0.8}
            >
              <ThemedText style={sharedStyles.buttonText}>Reset Password</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

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
    paddingTop: 60,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 