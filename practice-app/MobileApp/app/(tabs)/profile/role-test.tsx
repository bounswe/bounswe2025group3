import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_BASE_URL } from '@/constants/api';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Text
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function RoleTestScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Direct login without using TokenManager to test
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.access && data.refresh) {
        // Manually store tokens
        await SecureStore.setItemAsync('accessToken', data.access);
        await SecureStore.setItemAsync('refreshToken', data.refresh);
        
        // Show success with role info
        Alert.alert(
          'Login Successful', 
          `Logged in as: ${email}\nRole: ${data.role || 'Unknown'}\n\nRestart the app to see changes.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/'),
            },
          ]
        );
      } else {
        // Show error message
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const useTestCredentials = (userType: 'admin' | 'regular') => {
    if (userType === 'admin') {
      setEmail('admin@example.com');
      setPassword('adminpass');
    } else {
      setEmail('regular@example.com');
      setPassword('userpass123');
    }
  };

  const clearTokens = async () => {
    try {
      await TokenManager.forceResetState();
      Alert.alert('Success', 'Tokens cleared. You are now logged out.');
    } catch (error) {
      console.error('Error clearing tokens:', error);
      Alert.alert('Error', 'Failed to clear tokens');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Role Test Login</ThemedText>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={styles.loginButton}
          onPress={login}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.quickButtons}>
          <TouchableOpacity
            style={[styles.quickButton, styles.adminButton]}
            onPress={() => useTestCredentials('admin')}
          >
            <Text style={styles.buttonText}>Use Admin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickButton, styles.userButton]}
            onPress={() => useTestCredentials('regular')}
          >
            <Text style={styles.buttonText}>Use Regular</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.loginButton, styles.logoutButton]}
          onPress={clearTokens}
        >
          <Text style={styles.buttonText}>Clear Tokens</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  quickButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: '#D32F2F',
    marginRight: 5,
  },
  userButton: {
    backgroundColor: '#0288D1',
    marginLeft: 5,
  },
  logoutButton: {
    backgroundColor: '#757575',
  },
}); 