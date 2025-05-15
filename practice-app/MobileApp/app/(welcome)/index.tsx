import { sharedStyles } from '@/components/ui/styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();
  const { width, height } = Dimensions.get('window');

  const handleLoginPress = () => {
    router.push("/(welcome)/login");
  };

  const handleRegisterPress = () => {
    router.push("/(welcome)/register");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#88eb9a', '#122e1a']}
        style={styles.backgroundGradient}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Image 
                source={require('@/assets/images/greener-logo.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Text style={styles.appName}>GREENER</Text>
              <Text style={styles.subtitle}>Make Every Day a Zero Waste Day</Text>
              <Text style={styles.description}>Join our community to track waste, earn rewards, and live sustainably!</Text>
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

            <View style={[sharedStyles.buttonContainer, styles.buttonWrapper]}>
              <TouchableOpacity 
                style={[styles.button, styles.loginButton]} 
                onPress={handleRegisterPress}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="person-add-outline" size={24} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>Start Your Journey</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.registerButton]} 
                onPress={handleLoginPress}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="log-in-outline" size={24} color="#56ea62" style={styles.buttonIcon} />
                  <Text style={styles.secondaryButtonText}>Log In</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
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
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  features: {
    width: '100%',
    paddingHorizontal: 10,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    height: 50,
    borderRadius: 6,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#56ea62',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#56ea62',
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#56ea62',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
