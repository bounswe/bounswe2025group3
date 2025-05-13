import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    }
  };

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
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#2E7D32" />
          </View>
          <ThemedText style={styles.name}>
            {profile?.first_name} {profile?.last_name}
          </ThemedText>
          <ThemedText style={styles.username}>@{profile?.username}</ThemedText>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#2E7D32" />
              <ThemedText style={styles.infoText}>{profile?.email}</ThemedText>
            </View>
            {profile?.city && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#2E7D32" />
                <ThemedText style={styles.infoText}>
                  {profile.city}, {profile.country}
                </ThemedText>
              </View>
            )}
            {profile?.bio && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={20} color="#2E7D32" />
                <ThemedText style={styles.infoText}>{profile.bio}</ThemedText>
              </View>
            )}
            {profile?.date_joined && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" />
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
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/edit')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="create-outline" size={24} color="#2E7D32" />
              <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/change-password')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed" size={24} color="#2E7D32" />
              <ThemedText style={styles.settingText}>Change Password</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleLogout}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="log-out" size={24} color="#D32F2F" />
              <ThemedText style={[styles.settingText, styles.logoutText]}>Logout</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Linking.openURL('https://github.com/bounswe/bounswe2025group3')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="logo-github" size={24} color="#333" />
              <ThemedText style={styles.settingText}>GitHub</ThemedText>
            </View>
            <Ionicons name="open-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '500',
  },
}); 