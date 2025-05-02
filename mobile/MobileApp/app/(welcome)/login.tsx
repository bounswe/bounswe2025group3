import { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import CustomAlert from '@/components/CustomAlert';
import { sharedStyles } from '@/components/ui/styles';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
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

  const handleLogin = () => {
    if (!email || !password) {
      showAlert("Error", "Please fill in both email and password");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showAlert("Success", "Logged in successfully", "success");
      // Navigate to tabs/home after successful login
      router.replace("/(tabs)/home");
    }, 1500);
  };

  const handleResetPassword = () => {
    router.push("/(welcome)/reset-password");
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={sharedStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#2E7D32" />
      </TouchableOpacity>
      <View style={sharedStyles.content}>
        <ThemedText style={styles.title}>Login</ThemedText>
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

          <TouchableOpacity 
            style={[sharedStyles.button, isLoading && sharedStyles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={sharedStyles.buttonText}>Login</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleResetPassword}
            style={styles.forgotPasswordContainer}
          >
            <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  forgotPasswordContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#2E7D32',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
