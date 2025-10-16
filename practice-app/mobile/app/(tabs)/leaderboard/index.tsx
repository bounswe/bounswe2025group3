import { useColors } from '@/constants/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Player {
  id: string;
  rank: number;
  name: string;
  score: number;
  isCurrentUser?: boolean;
}

// Dummy data
const DUMMY_PLAYERS: Player[] = [
  { id: '1', rank: 1, name: 'Kageaki', score: 1250, isCurrentUser: true },
  { id: '2', rank: 2, name: 'GreenThumbAlex', score: 1180 },
  { id: '3', rank: 3, name: 'RecycleRahul', score: 1100 },
  { id: '4', rank: 4, name: 'SustainableSam', score: 950 },
  { id: '5', rank: 5, name: 'PlanetSaverPat', score: 920 },
  { id: '6', rank: 6, name: 'ZeroWasteZoe', score: 880 },
  { id: '7', rank: 7, name: 'ClimateCarlos', score: 850 },
  { id: '8', rank: 8, name: 'NatureNina', score: 760 },
  { id: '9', rank: 9, name: 'EarthEnthusiast', score: 730 },
  { id: '10', rank: 10, name: 'ForestFriend', score: 700 },
];

export default function LeaderboardScreen() {
  const colors = useColors();

  const AVATAR_COLORS = [colors.success, colors.blue, colors.sun, '#E91E63', '#9C27B0'];
  const getColorForInitial = (initial: string) => {
    const index = initial.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const LeaderboardItem = ({ player }: { player: Player }) => {
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
    container: { flex: 1, paddingHorizontal: 10},
    header: { height: "7%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.primary},
    headerBarLogo: { width: 52, height: 52 },
    title: { marginLeft: "5%",fontSize: 22, fontWeight: "600", color: colors.primary },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 25 },
    listContainer: { paddingBottom: 20 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 12, paddingVertical: 12, backgroundColor: colors.cb2, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderWidth: 1, borderColor: colors.borders, },
    headerText: { fontSize: 12, fontWeight: 'bold', color: colors.text, letterSpacing: 0.5 },
    playerHeaderText: { flex: 1, marginLeft: 50 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', padding: "3%", backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borders, },
    currentUserContainer: { backgroundColor: colors.cb2, borderColor: colors.primary, borderWidth: 1.5, borderRadius: 8 },
    rankContainer: { width: 40, alignItems: 'center', marginRight: 10 },
    rankText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    playerContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    initialCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style = {styles.header}>
      <Image 
          source={require('@/assets/images/reversed-icon.png')} 
          style={styles.headerBarLogo} 
          resizeMode="contain"
        />
        <Text style={styles.title}>Community Leaderboard</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={DUMMY_PLAYERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LeaderboardItem player={item} />}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}