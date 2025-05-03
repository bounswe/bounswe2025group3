import { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from "expo-router";
import CustomAlert from '@/components/CustomAlert';
import { sharedStyles } from '@/components/ui/styles';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      showAlert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      showAlert(
        "Error",
        "Password must be at least 8 characters long and contain at least one number."
      );
      return;
    }

    // TODO: Implement API call for registration
    // Example API call structure:
    /*
    try {
      const response = await fetch('YOUR_API_ENDPOINT/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle successful registration
        showAlert("Success", "Registered successfully", "success");
        navigation.reset({
          index: 0,
          routes: [{ name: '(tabs)/home' as never }],
        });
      } else {
        // Handle registration error
        showAlert("Error", "Registration failed. Please try again.");
      }
    } catch (error) {
      showAlert("Error", "An error occurred during registration");
    }
    */

    // Temporary success for testing
    showAlert("Success", "Registered successfully", "success");
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
          <ThemedText style={styles.title}>Register</ThemedText>
          <View style={sharedStyles.form}>
            <View style={sharedStyles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
              <TextInput
                style={sharedStyles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={sharedStyles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
              <TextInput
                style={sharedStyles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
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
                placeholder="Confirm Password"
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
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <ThemedText style={sharedStyles.buttonText}>Register</ThemedText>
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
});
