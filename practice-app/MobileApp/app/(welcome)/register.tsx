import CustomAlert from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { sharedStyles } from '@/components/ui/styles';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
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
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showAlert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password1: password,
          password2: confirmPassword,
        }),
      });

      if (response.ok) {
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
      } else {
        const errorData = await response.json();
        if (errorData.username) {
          showAlert("Error", "Username is already taken");
        } else if (errorData.email) {
          showAlert("Error", "Email is already registered");
        } else if (errorData.password1) {
          showAlert("Error", errorData.password1[0]);
        } else {
          showAlert("Error", "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      showAlert("Error", "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#88eb9a', '#122e1a']}
        style={styles.backgroundGradient}
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.content}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <Image 
                source={require('@/assets/images/greener-logo.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <ThemedText style={styles.title}>Create Account</ThemedText>
              <ThemedText style={styles.subtitle}>Join our eco-friendly community</ThemedText>
            </View>

            <View style={styles.formContainer}>
              <View style={[sharedStyles.inputContainer, styles.inputOverride]}>
                <Ionicons name="person-outline" size={20} color="#2E7D32" style={sharedStyles.inputIcon} />
                <TextInput
                  style={sharedStyles.input}
                  placeholder="Username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={[sharedStyles.inputContainer, styles.inputOverride]}>
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

              <View style={[sharedStyles.inputContainer, styles.inputOverride]}>
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

              <View style={[sharedStyles.inputContainer, styles.inputOverride]}>
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
                style={[styles.registerButton, isLoading && { opacity: 0.7 }]} 
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.buttonText}>
                  {isLoading ? "Registering..." : "Create Account"}
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
                <TouchableOpacity onPress={() => router.push("/(welcome)/login")}>
                  <ThemedText style={styles.loginLink}>Sign In</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
  },
  inputOverride: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: '#56ea62',
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 14,
  },
  loginLink: {
    color: '#56ea62',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
