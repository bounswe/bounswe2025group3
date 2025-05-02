import { Text, View, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from "react-native";
import { useRef, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { sharedStyles } from '@/components/ui/styles';

export default function Index() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLoginPress = () => {
    router.push("/(welcome)/login");
  };

  const handleRegisterPress = () => {
    router.push("/(welcome)/register");
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Ionicons name="leaf" size={60} color="#2E7D32" style={sharedStyles.logo} />
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>ZeroWaste</Text>
        <Text style={styles.subtitle}>Join our community in making the world a better place</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.features,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={sharedStyles.featureItem}>
          <Ionicons name="leaf-outline" size={24} color="#2E7D32" />
          <Text style={sharedStyles.featureText}>Track your waste reduction</Text>
        </View>
        <View style={sharedStyles.featureItem}>
          <Ionicons name="trophy-outline" size={24} color="#2E7D32" />
          <Text style={sharedStyles.featureText}>Earn achievements</Text>
        </View>
        <View style={sharedStyles.featureItem}>
          <Ionicons name="people-outline" size={24} color="#2E7D32" />
          <Text style={sharedStyles.featureText}>Join the community</Text>
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          sharedStyles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity 
          style={[styles.button, sharedStyles.loginButton]} 
          onPress={handleLoginPress}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="log-in-outline" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={sharedStyles.buttonText}>Login</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, sharedStyles.registerButton]} 
          onPress={handleRegisterPress}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="person-add-outline" size={24} color="#2E7D32" style={styles.buttonIcon} />
            <Text style={[sharedStyles.buttonText, sharedStyles.registerButtonText]}>Register</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#666',
    marginBottom: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  features: {
    marginBottom: 40,
  },
  button: {
    height: 50,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  buttonIcon: {
    marginRight: 10,
  },
});
