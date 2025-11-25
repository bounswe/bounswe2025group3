import { useColors } from '@/constants/colors';
import { getUserProfile } from '@/api/user';
import { getMyScore } from '@/api/waste';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { formatDateShort } from "@/i18n/utils";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  city: string;
  country: string;
  role: string;
  date_joined: string;
  notifications_enabled: boolean;
  score: number;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const colors = useColors();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { height: "7%", paddingHorizontal: "4%", paddingTop: "4%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background},
    backButton: { alignSelf: 'flex-start' },
    contentContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    profileHeader: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.cb1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.borders, marginBottom: 16 },
    username: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginTop: 4 },
    fullName: { fontSize: 26, fontWeight: 'bold', color: colors.text },
    bio: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 10, fontStyle: 'italic', lineHeight: 22 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.cb1, paddingVertical: 16, paddingHorizontal: 10, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.borders },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    statValueSecondary: { fontSize: 18, fontWeight: '600', color: colors.text },
    statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
    separator: { width: 1, backgroundColor: colors.borders },
    editButton: { flexDirection: 'row', gap: 10, backgroundColor: colors.cb1, paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borders, marginBottom: 30 },
    editButtonText: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    postsContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: colors.cb1, borderRadius: 12, borderWidth: 1, borderColor: colors.borders },
    postsPlaceholderTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textSecondary, marginTop: 16 },
    postsPlaceholderText: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  });

  const fetchProfile = async () => {
    try {
      const [profileData, scoreData] = await Promise.all([
        getUserProfile(),
        getMyScore()
      ]);

      if (profileData && scoreData !== undefined) {
        setProfile({ ...profileData, score: scoreData });
      }

    } catch (error) {
      console.error('Error fetching profile and score:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchProfile();
  }, []));

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileHeader}>
        <Image source={require("@/assets/images/kageaki.png")} style={styles.avatarContainer} />
          <Text style={styles.fullName}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio || t("profile.no_bio")}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.score.toFixed(1)}</Text>
            <Text style={styles.statLabel}>{t("profile.total_points")}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statBox}>
            <Text style={styles.statValueSecondary}>{formatDateShort(profile.date_joined)}</Text>
            <Text style={styles.statLabel}>{t("profile.member_since")}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit_profile')}>
          <Feather name="edit" size={16} color={colors.text} />
          <Text style={styles.editButtonText}>{t("profile.edit_profile")}</Text>
        </TouchableOpacity>

        <View style={styles.postsContainer}>
          <Feather name="grid" size={32} color={colors.textSecondary} />
          <Text style={styles.postsPlaceholderTitle}>{t("profile.your_posts")}</Text>
          <Text style={styles.postsPlaceholderText}>{t("profile.posts_placeholder")}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}