import { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { sharedStyles } from '@/components/ui/styles';
import CustomAlert from '@/components/CustomAlert';
import { useRouter} from 'expo-router';

export default function ResetPasswordScreen() {
  const [resetEmail, setResetEmail] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const router = useRouter();

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleSendResetCode = () => {
    if (!resetEmail) {
      showAlert("Error", "Please enter your email address");
      return;
    }

    // TODO: Implement API call to send reset code
    // Example API call structure:
    /*
    try {
      const response = await fetch('YOUR_API_ENDPOINT/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle successful reset code sent
        navigation.reset({
          index: 0,
          routes: [{ name: '(welcome)/reset-code' as never }],
        });
      } else {
        // Handle error
        showAlert("Error", "Failed to send reset code. Please try again.");
      }
    } catch (error) {
      showAlert("Error", "An error occurred while sending reset code");
    }
    */

    // Temporary success for testing
    router.push("/(welcome)/reset-code");
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
            Enter your email address and we'll send you a code to reset your password.
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
              />
            </View>

            <TouchableOpacity 
              style={sharedStyles.button} 
              onPress={handleSendResetCode}
              activeOpacity={0.8}
            >
              <ThemedText style={sharedStyles.buttonText}>Submit</ThemedText>
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
    paddingTop: 140,
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