import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator, Image, SafeAreaView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Define consistent colors from our web frontend
const GREENER_COLORS = {
  primary: '#2E7D32',
  secondary: '#56ea62',
  primaryDark: '#122e1a',
  primaryLight: '#88eb9a',
  background: '#E8F5E9',
  white: '#ffffff',
  text: {
    primary: '#333333',
    secondary: '#555555',
    light: '#666666',
  },
  danger: '#D32F2F'
};

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  date_joined: string;
  notifications_enabled: boolean;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE);
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    TokenManager.setEmail(null);
    await TokenManager.clearTokens();
    router.replace('/(welcome)');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREENER_COLORS.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[GREENER_COLORS.primaryLight, GREENER_COLORS.primaryDark]}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image 
              source={require('@/assets/images/greener-logo.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <ThemedText style={styles.headerTitle}>Profile</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREENER_COLORS.secondary]} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[GREENER_COLORS.primaryLight, GREENER_COLORS.primary]}
              style={styles.avatarBorder}
            >
              <View style={styles.avatarInner}>
                <Ionicons name="person" size={50} color={GREENER_COLORS.secondary} />
              </View>
            </LinearGradient>
          </View>
          <ThemedText style={styles.name}>
            {profile?.first_name} {profile?.last_name}
          </ThemedText>
          <ThemedText style={styles.username}>@{profile?.username}</ThemedText>
          
          <View style={styles.roleBadge}>
            <Ionicons 
              name={profile?.role === 'ADMIN' ? 'shield' : (profile?.role === 'MODERATOR' ? 'shield-half' : 'person')} 
              size={14} 
              color={GREENER_COLORS.white} 
            />
            <ThemedText style={styles.roleText}>{profile?.role}</ThemedText>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={GREENER_COLORS.secondary} />
              <ThemedText style={styles.infoText}>{profile?.email}</ThemedText>
            </View>
            {profile?.city && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={GREENER_COLORS.secondary} />
                <ThemedText style={styles.infoText}>
                  {profile.city}, {profile.country}
                </ThemedText>
              </View>
            )}
            {profile?.bio && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={20} color={GREENER_COLORS.secondary} />
                <ThemedText style={styles.infoText}>{profile.bio}</ThemedText>
              </View>
            )}
            {profile?.date_joined && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={GREENER_COLORS.secondary} />
                <ThemedText style={styles.infoText}>
                  Joined {new Date(profile.date_joined).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/profile/edit')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="create-outline" size={24} color={GREENER_COLORS.secondary} />
                <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={24} color={GREENER_COLORS.text.light} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/profile/change-password')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed" size={24} color={GREENER_COLORS.secondary} />
                <ThemedText style={styles.settingText}>Change Password</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={24} color={GREENER_COLORS.text.light} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/profile/jwt-debug')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="key-outline" size={24} color={GREENER_COLORS.secondary} />
                <ThemedText style={styles.settingText}>Debug JWT Token</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={24} color={GREENER_COLORS.text.light} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out" size={24} color={GREENER_COLORS.white} />
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREENER_COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GREENER_COLORS.background,
  },
  headerBackground: {
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GREENER_COLORS.white,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    backgroundColor: GREENER_COLORS.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: GREENER_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    color: GREENER_COLORS.primary,
  },
  username: {
    fontSize: 16,
    color: GREENER_COLORS.text.light,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREENER_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  roleText: {
    color: GREENER_COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: GREENER_COLORS.primary,
  },
  infoCard: {
    backgroundColor: GREENER_COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: GREENER_COLORS.background,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: GREENER_COLORS.text.primary,
  },
  settingsCard: {
    backgroundColor: GREENER_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: GREENER_COLORS.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: GREENER_COLORS.background,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: GREENER_COLORS.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREENER_COLORS.danger,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutButtonText: {
    color: GREENER_COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
}); 