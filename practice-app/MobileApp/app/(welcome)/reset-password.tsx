import CustomAlert from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { sharedStyles } from '@/components/ui/styles';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function ResetPasswordScreen() {
  const [resetEmail, setResetEmail] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      showAlert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (response.ok) {
        showAlert(
          "Success", 
          "Password reset instructions have been sent to your email. Please check your inbox and follow the link to reset your password.",
          "success"
        );
        setTimeout(() => {
          setAlertVisible(false);
          router.back();
        }, 3000);
      } else {
        showAlert("Error", "Failed to send reset instructions. Please try again.");
      }
    } catch (error) {
      showAlert("Error", "Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            Enter your email address and we'll send you instructions to reset your password.
          </ThemedText>

          <View style={sharedStyles.form}>
            <View style={sharedStyles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
              <TextInput
                style={sharedStyles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={sharedStyles.button} 
              onPress={handleResetPassword}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <ThemedText style={sharedStyles.buttonText}>
                {isLoading ? "Submitting..." : "Submit"}
              </ThemedText>
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
    paddingTop: 180,
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