import TokenManager from '@/app/tokenManager';
import CustomAlert from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { sharedStyles } from '@/components/ui/styles';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { isTunnelMode, DOCKER_BACKEND_URL, TUNNEL_BACKEND_URL } from '@/constants/docker-env';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  // Collect debug information
  useEffect(() => {
    const info = `
      Platform: ${Platform.OS}
      Tunnel Mode: ${isTunnelMode() ? "Yes" : "No"}
      API URL: ${API_BASE_URL}
    `;
    setDebugInfo(info);
    console.log("Debug Info:", info);
  }, []);

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Error", "Please fill in both email and password");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Attempting login with email: ${email}`);
      
      // Use test account regardless of backend connection for demo
      if (email === "test@example.com" && password === "password123") {
        console.log("Using test account - bypassing backend");
        // Create a dummy token for testing
        const dummyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        await TokenManager.saveTokens(dummyToken, dummyToken);
        TokenManager.setEmail(email);
        showAlert("Success", "Logged in with test account", "success");
        
        // Wait a bit to show the success message
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1000);
        return;
      }
      
      // Determine best API URL
      let apiUrl = API_BASE_URL;
      if (isTunnelMode()) {
        // In tunnel mode, URL in constants might not be usable from the device
        console.log('Running in tunnel mode, using tunnel URL');
        apiUrl = TUNNEL_BACKEND_URL;
      }
      
      console.log(`Using API URL: ${apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`);

      const response = await fetch(`${apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log(`Login response status: ${response.status}`);
      
      // For debugging - show the response even for errors
      let responseText;
      try {
        responseText = await response.text();
        console.log(`Response body: ${responseText}`);
      } catch (e) {
        console.log(`Error reading response text: ${e}`);
        responseText = 'Unable to read response';
      }

      // Parse the response if it's JSON
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.log(`Error parsing JSON: ${e}`);
        json = null;
      }

      if (response.ok && json && "access" in json) {
        const { access, refresh } = json;
        console.log("Login successful, saving tokens");
        await TokenManager.saveTokens(access, refresh);
        TokenManager.setEmail(email);
        showAlert("Success", "Logged in successfully", "success");
        router.replace("/(tabs)");
      } else {
        const errorMsg = json && json.detail ? json.detail : "Invalid email or password";
        console.log(`Login error: ${errorMsg}`);
        showAlert("Error", errorMsg);
      }
    } catch (error) {
      console.error(`Login exception: ${error}`);
      showAlert("Error", `Connection error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    router.push("/(welcome)/reset-password");
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
              <ThemedText style={styles.title}>Welcome Back</ThemedText>
              <ThemedText style={styles.subtitle}>Sign in to continue your eco journey</ThemedText>
            </View>

            <View style={styles.formContainer}>
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

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.buttonText}>
                  {isLoading ? "Logging in..." : "Login"}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleResetPassword}
                style={styles.forgotPasswordContainer}
              >
                <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.registerContainer}>
                <ThemedText style={styles.registerText}>Don't have an account? </ThemedText>
                <TouchableOpacity onPress={() => router.push("/(welcome)/register")}>
                  <ThemedText style={styles.registerLink}>Sign Up</ThemedText>
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
    left: 0,
    zIndex: 10,
    padding: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  inputOverride: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginButton: {
    backgroundColor: '#56ea62',
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
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
  forgotPasswordContainer: {
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  registerText: {
    color: '#333',
  },
  registerLink: {
    color: '#56ea62',
    fontWeight: 'bold',
  },
});
