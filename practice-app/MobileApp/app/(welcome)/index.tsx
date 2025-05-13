import { sharedStyles } from '@/components/ui/styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const handleLoginPress = () => {
    router.push("/(welcome)/login");
  };

  const handleRegisterPress = () => {
    router.push("/(welcome)/register");
  };

  return (
    <ImageBackground
      source={require('@/assets/images/welcome.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="leaf" size={60} color="#2E7D32" style={sharedStyles.logo} />
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.appName}>Greener</Text>
            <Text style={styles.subtitle}>Join our community in making the world a better place</Text>
          </View>

          <View style={styles.features}>
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
          </View>

          <View style={sharedStyles.buttonContainer}>
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
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
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
