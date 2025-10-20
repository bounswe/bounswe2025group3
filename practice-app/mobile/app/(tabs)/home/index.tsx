import { Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { ActivityIndicator, Dimensions, Image, ImageSourcePropType, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';

import { useColors } from '@/constants/colors';
import { getGoals, getMyScore, Goal } from "@/api/functions";

const { width } = Dimensions.get('window');
const GOAL_CARD_WIDTH = width * 0.45;
const HORIZONTAL_PADDING = width * 0.03;

const calculateEndDate = (start: Date, time: 'daily' | 'weekly' | 'monthly'): Date => {
  const end = new Date(start);
  switch (time) {
    case 'daily': end.setDate(end.getDate() + 1); break;
    case 'weekly': end.setDate(end.getDate() + 7); break;
    case 'monthly': end.setMonth(end.getMonth() + 1); break;
  }
  return end;
};

const dummyPosts = [
  {
    id: '1',
    username: 'Beatrice',
    userImage: require("@/assets/images/beatrice.jpg"),
    postAge: '8h ago',
    caption: 'Took a big step this weekend by using cloth bags instead of plastic! Guess we all need to start somewhere. 🌿 #ZeroWaste',
    postImage: null,
    likes: 124,
    comments: 42,
  },
  {
    id: '2',
    username: 'Klein',
    userImage: require("@/assets/images/klein.jpg"),
    postAge: '1d ago',
    caption: 'My compost pile is finally thriving! What are your best tips for a beginner composter? Looking for advice on what to add (and what to avoid).',
    postImage: require("@/assets/images/compost.jpg"),
    likes: 258,
    comments: 112,
  },
  {
    id: '3',
    username: 'Magsarion',
    userImage: require("@/assets/images/magsarion.jpg"),
    postAge: '5h ago',
    caption: 'Just repaired my old lamp instead of buying a new one.',
    postImage: require("@/assets/images/lamp.jpg"),
    likes: 60,
    comments: 10,
  },
];

const PostImage = ({ source, width }: { source: ImageSourcePropType, width: number }) => {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (typeof source === "number") {
      const { width: w, height: h } = Image.resolveAssetSource(source);
      if (w > 0) setHeight(width * (h / w));
    } else if (typeof source === "string") {
      Image.getSize(source, (w, h) => { if (w > 0) setHeight(width * (h / w)) }, console.error);
    }
  }, [source, width]);

  if (!height) return null;

  return <Image source={source} style={{ width, height, borderRadius: 12, marginBottom: 12 }} resizeMode="cover" />;
};

export default function HomeScreen() {
  const [userScore, setUserScore] = useState<number | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colors = useColors();
  const isInitialLoad = useRef(true);

  const fetchData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const [scoreData, allGoals] = await Promise.all([getMyScore(), getGoals()]);
      setUserScore(scoreData);

      const now = new Date();
      const active = allGoals
        .filter((goal: Goal) => {
          const endDate = calculateEndDate(new Date(goal.start_date), goal.timeframe);
          return !goal.is_complete && endDate.getTime() >= now.getTime();
        })
        .sort((a: Goal, b: Goal) => {
          const endDateA = calculateEndDate(new Date(a.start_date), a.timeframe);
          const endDateB = calculateEndDate(new Date(b.start_date), b.timeframe);
          return endDateA.getTime() - endDateB.getTime();
        });
      setActiveGoals(active);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (showLoader) setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, []);

  useEffect(() => {
    fetchData(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isInitialLoad.current) {
        fetchData(false);
      } else {
        isInitialLoad.current = false;
      }
    }, [])
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    headerBar: { height: "7%", paddingHorizontal: "4%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
    headerBarLogo: { width: 52, height: 52 },
    content: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    statsCard: { marginHorizontal: "2%", marginTop: "4%", paddingHorizontal: "5%", paddingVertical: "3%", backgroundColor: colors.cb1, borderRadius: 16 },
    statsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    statsTitle: { fontSize: 16, fontWeight: '600', marginLeft: 12, color: colors.primary },
    scoreValueContainer: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', backgroundColor: colors.cb1, paddingHorizontal: 16, borderRadius: 16 },
    scoreValue: { fontSize: 32, fontWeight: '700', color: colors.primary, marginRight: 8 },
    scoreUnitLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '4%', marginTop: '5%' },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
    seeAllText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
    horizontalScrollContent: { paddingHorizontal: HORIZONTAL_PADDING, paddingVertical: 8 },
    goalScrollItem: { width: GOAL_CARD_WIDTH, backgroundColor: colors.cb1, borderRadius: 16, padding: 16, marginHorizontal: HORIZONTAL_PADDING / 3, borderWidth: 1, borderColor: colors.borders, justifyContent: 'space-between', minHeight: 140 },
    goalTitle: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1, marginBottom: 8 },
    progressContainer: { marginVertical: 6 },
    progressBar: { height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
    progressText: { fontSize: 12, color: colors.textSecondary, textAlign: 'right' },
    deadlineContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    deadlineText: { fontSize: 12, color: colors.error },
    emptyStateContainer: { marginHorizontal: '4%', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.cb1, borderRadius: 16, minHeight: 150 },
    emptyStateText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginVertical: 12 },
    addButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    addButtonText: { color: colors.background, fontSize: 14, fontWeight: '500' },
    postCard: { backgroundColor: colors.cb1, marginHorizontal: '1%', borderRadius: 16, marginBottom: "1%", padding: 12, borderWidth: 1, borderColor: colors.borders },
    postHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: "1%" },
    postHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    postUserImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    postUserInfo: { flex: 1 },
    postUsername: { color: colors.text, fontWeight: '600', fontSize: 15 },
    postAge: { color: colors.textSecondary, fontSize: 13 },
    postCaption: { color: colors.text, fontSize: 15, lineHeight: 22, marginBottom: 12 },
    postActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    postActionGroup: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    postActionButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    postActionText: { color: colors.textSecondary, fontWeight: '500', fontSize: 14 },
    postLikeText: { color: colors.primary, fontWeight: '600', fontSize: 14 }
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerBar}>
        <Image source={require('@/assets/images/reversed-icon.png')} style={styles.headerBarLogo} resizeMode="contain" />
        <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '700' }}>GREENER</Text>
        <TouchableOpacity style={{ marginLeft: "auto" }} onPress={() => router.push('/menu_drawer')}>
          <Fontisto name="nav-icon-grid-a" size={24} style={{ paddingRight: "2%" }} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <MaterialCommunityIcons name="star-four-points-outline" size={24} color={colors.primary} />
            <Text style={styles.statsTitle}>Your Eco Score</Text>
          </View>
          <View style={styles.scoreValueContainer}>
            <Text style={styles.scoreValue}>{userScore ? Number(userScore).toFixed(1) : '0.0'}</Text>
            <Text style={styles.scoreUnitLabel}>Points</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Goal Deadlines</Text>
          <TouchableOpacity onPress={() => router.push('/goals')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {activeGoals.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
            {activeGoals.map(goal => (
              <TouchableOpacity activeOpacity={0.8} key={goal.id} style={styles.goalScrollItem} onPress={() => router.push({ pathname: "/goals/[id]", params: { id: goal.id } })}>
                <Text style={styles.goalTitle} numberOfLines={2}>{goal.category.name}</Text>
                <View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${(goal.progress / goal.target) * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{goal.progress.toFixed(1)}/{goal.target.toFixed(1)} {goal.category.unit}</Text>
                  </View>
                  <View style={styles.deadlineContainer}>
                    <Ionicons name="time-outline" size={14} color={colors.error} />
                    <Text style={styles.deadlineText}>
                      Due: {calculateEndDate(new Date(goal.start_date), goal.timeframe).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="flag-outline" size={32} color={colors.primary} />
            <Text style={styles.emptyStateText}>You have no upcoming goals.</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/goals/add')}>
              <Text style={styles.addButtonText}>Create New Goal</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discover</Text>
        </View>

        {dummyPosts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postHeaderLeft}>
                <Image source={post.userImage} style={styles.postUserImage} />
                <View style={styles.postUserInfo}>
                  <Text style={styles.postUsername}>{post.username}</Text>
                  <Text style={styles.postAge}>{post.postAge}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.postCaption}>{post.caption}</Text>
            {post.postImage && <PostImage source={post.postImage} width={width - (width*0.02) - 24} />}
            <View style={styles.postActions}>
              <View style={styles.postActionGroup}>
                <TouchableOpacity style={styles.postActionButton}>
                  <MaterialCommunityIcons name="star-four-points-outline" size={22} color={colors.primary} />
                  <Text style={styles.postLikeText}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postActionButton}>
                  <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
                  <Text style={styles.postActionText}>{post.comments}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.postActionGroup}>
                <TouchableOpacity style={styles.postActionButton}>
                  <Ionicons name="paper-plane-outline" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.postActionButton}>
                  <Ionicons name="bookmark-outline" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}