import { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { sharedStyles } from '@/components/ui/styles';
import CustomAlert from '@/components/CustomAlert';
import { useRouter } from 'expo-router';

export default function ResetCodeScreen() {
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleVerifyResetCode = () => {
    if (!resetCode || !newPassword || !confirmNewPassword) {
      showAlert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
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

    setIsLoading(true);
    // Simulate API call to verify code and reset password
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      showAlert(
        "Success", 
        "Password has been reset successfully. You can now login with your new password.",
        "success"
      );
    }, 1500);
  };

  if (isSuccess) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.innerContent}>
            <ThemedText style={styles.title}>Password Reset Successful</ThemedText>
            <ThemedText style={styles.subtitle}>
              Your password has been reset successfully. You can now login with your new password.
            </ThemedText>

            <TouchableOpacity 
              style={[sharedStyles.button, styles.backToLoginButton]} 
              onPress={() => router.push("/(welcome)/login")}
              activeOpacity={0.8}
            >
              <ThemedText style={sharedStyles.buttonText}>Back to Login</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    );
  }

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
          <ThemedText style={styles.title}>Enter Reset Code</ThemedText>
          <ThemedText style={styles.subtitle}>
            Please enter the reset code sent to your email and your new password.
          </ThemedText>

          <View style={sharedStyles.form}>
            <View style={sharedStyles.inputContainer}>
              <Ionicons name="key-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
              <TextInput
                style={sharedStyles.input}
                placeholder="Reset Code"
                placeholderTextColor="#666"
                value={resetCode}
                onChangeText={setResetCode}
                keyboardType="number-pad"
                autoCapitalize="none"
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
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={sharedStyles.eyeIcon}>
                <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            <View style={sharedStyles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
              <TextInput
                style={sharedStyles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#666"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={!showConfirmNewPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)} style={sharedStyles.eyeIcon}>
                <Ionicons name={showConfirmNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[sharedStyles.button, isLoading && sharedStyles.buttonDisabled]} 
              onPress={handleVerifyResetCode}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={sharedStyles.buttonText}>Reset Password</ThemedText>
              )}
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
  backToLoginButton: {
    marginTop: 20,
  },
}); 