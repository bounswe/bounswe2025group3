import { useColors } from '@/constants/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from '@/api/functions';
import tokenManager from '@/services/tokenManager';

// API'dan gelen ham liderlik tablosu verisi
interface ApiLeaderboardUser {
  id: number;
  username: string;
  total_waste_quantity: string;
}

// API'dan gelen ham kullanıcı profili verisi
interface ApiUserProfile {
  id: number;
  username: string;
}

// Ekranda gösterilecek işlenmiş veri
interface LeaderboardPlayer {
  id: string;
  rank: number;
  name: string;
  score: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardScreen() {
  const colors = useColors();

  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadScreenData = async () => {
        setLoading(true);
        setError(null);
        try {
          const leaderboardPromise = tokenManager.authenticatedFetch(`/api/v1/waste/leaderboard/`);
          const userProfilePromise = getUserProfile();

          const [leaderboardResponse, userProfile] = await Promise.all([
            leaderboardPromise,
            userProfilePromise,
          ]);

          if (!leaderboardResponse.ok) {
            throw new Error('Failed to fetch leaderboard data.');
          }

          if (!userProfile || typeof userProfile.id === 'undefined') {
            throw new Error('Failed to fetch user profile.');
          }
          
          const leaderboardData: ApiLeaderboardUser[] = await leaderboardResponse.json();
          const currentUserId = userProfile.id;

          const formattedPlayers: LeaderboardPlayer[] = leaderboardData.map((user, index) => ({
            id: String(user.id),
            name: user.username,
            score: Math.round(parseFloat(user.total_waste_quantity)),
            rank: index + 1,
            isCurrentUser: user.id === currentUserId,
          }));
          
          setPlayers(formattedPlayers);
        } catch (err) {
          console.error(err);
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      };

      loadScreenData();
    }, [])
  );

  const AVATAR_COLORS = [colors.success, colors.blue, colors.sun, '#E91E63', '#9C27B0'];
  const getColorForInitial = (initial: string) => {
    const index = initial.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const LeaderboardItem = ({ player }: { player: LeaderboardPlayer }) => {
    const { rank, name, score, isCurrentUser } = player;

    const renderRank = () => {
      if (rank === 1) return <FontAwesome5 name="medal" size={24} color={colors.sun} />;
      if (rank === 2) return <FontAwesome5 name="medal" size={24} color="#C0C0C0" />;
      if (rank === 3) return <FontAwesome5 name="medal" size={24} color="#CD7F32" />;
      return <Text style={styles.rankText}>{rank}</Text>;
    };

    const initial = name.charAt(0).toUpperCase();
    const initialColor = getColorForInitial(initial);

    return (
      <View style={[styles.itemContainer, isCurrentUser && styles.currentUserContainer]}>
        <View style={styles.rankContainer}>{renderRank()}</View>
        <View style={styles.playerContainer}>
          {isCurrentUser ? (
            <Image
              source={require('@/assets/images/kageaki.png')}
              style={styles.avatarImage}
            />
          ) : (
            <View style={[styles.initialCircle, { backgroundColor: initialColor }]}>
              <Text style={styles.initialText}>{initial}</Text>
            </View>
          )}
          <Text style={styles.playerName}>{name}</Text>
          {isCurrentUser && (
            <View style={styles.youTag}>
              <Text style={styles.youTagText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={styles.scoreText}>{score} pts</Text>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: 10 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: colors.error, fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
    header: { height: "7%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.primary },
    headerBarLogo: { width: 52, height: 52 },
    title: { marginLeft: "5%",fontSize: 22, fontWeight: "600", color: colors.primary },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 25 },
    listContainer: { paddingBottom: 20 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 12, paddingVertical: 12, backgroundColor: colors.cb3, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderWidth: 1, borderColor: colors.borders },
    headerText: { fontSize: 12, fontWeight: 'bold', color: colors.text, letterSpacing: 0.5 },
    playerHeaderText: { flex: 1, marginLeft: 50 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', padding: "3%", backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.borders },
    currentUserContainer: { backgroundColor: colors.cb3, borderColor: colors.primary, borderWidth: 1.5, borderRadius: 8 },
    rankContainer: { width: 40, alignItems: 'center', marginRight: 10 },
    rankText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    playerContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    initialCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    initialText: { color: colors.background, fontSize: 18, fontWeight: 'bold' },
    playerName: { fontSize: 16, fontWeight: '500', color: colors.text },
    youTag: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
    youTagText: { color: colors.background, fontSize: 11, fontWeight: 'bold' },
    scoreText: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  });

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.headerText}>RANK</Text>
      <Text style={[styles.headerText, styles.playerHeaderText]}>PLAYER</Text>
      <Text style={styles.headerText}>SCORE</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LeaderboardItem player={item} />}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/reversed-icon.png')} 
          style={styles.headerBarLogo} 
          resizeMode="contain"
        />
        <Text style={styles.title}>Community Leaderboard</Text>
      </View>
      <View style={styles.container}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}