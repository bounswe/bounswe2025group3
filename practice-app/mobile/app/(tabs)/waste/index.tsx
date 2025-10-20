import { useColors } from '@/constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSubcategories, getWasteLogs, Subcategory, WasteLog, getMyScore } from '@/api/functions';

export default function WasteLogsScreen() {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colors = useColors();
  const isInitialLoad = useRef(true);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    headerBar: { height: "7%", paddingHorizontal: "4%", paddingTop: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
    headerBarLogo: { width: 52, height: 52 },
    headerTitle: { fontSize: 24, fontWeight: '600', color: colors.primary, marginLeft: "5%" },
    headerSpacer: { flex: 1 },
    content: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 10, paddingBottom: 40 },
    statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: colors.cb1, borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: colors.borders },
    statIcon: { marginBottom: 8 },
    statValue: { fontSize: 24, fontWeight: '600', color: colors.primary, marginBottom: 4 },
    statLabel: { fontSize: 14, color: colors.textSecondary },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: colors.primary, marginBottom: "4%", marginLeft: "2%" },
    logsContainer: { gap: 12 },
    logCard: { backgroundColor: colors.cb1, borderRadius: 12, padding: 16, marginBottom: "1%", shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, borderWidth: 1, borderColor: colors.borders },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    logTitleContainer: { flexDirection: 'row', alignItems: 'center' },
    logIcon: { marginRight: 8 },
    logTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    scoreContainer: { backgroundColor: colors.cb2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    logScore: { fontSize: 14, color: colors.primary, fontWeight: '600' },
    logDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    logQuantity: { fontSize: 14, color: colors.textSecondary },
    logDate: { fontSize: 14, color: colors.textSecondary },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: 16, borderRadius: 8, marginBottom: 24, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    addButtonText: { color: colors.background, fontSize: 16, fontWeight: '500' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12, gap: 4 },
    locationText: { fontSize: 14, color: colors.textSecondary },
    viewDetailsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borders },
    viewDetailsText: { fontSize: 14, color: colors.primary, marginRight: 4 },
    emptyState: { alignItems: 'center', padding: 32, backgroundColor: colors.cb1, borderRadius: 12, borderWidth: 1, borderColor: colors.borders },
    emptyStateText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 16 },
  });

  const fetchData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const [subcategoriesData, logsData, scoreData] = await Promise.all([
        getSubcategories(),
        getWasteLogs(),
        getMyScore()
      ]);
      setSubCategories(subcategoriesData);
      setLogs(logsData);
      setScore(scoreData);
    } catch (error) {
        console.error('Failed to fetch screen data:', error);
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

  const getSubCategoryUnit = (subCategoryId: number) => {
    const subCategory = subCategories.find(sc => sc.id === subCategoryId);
    return subCategory?.unit || '';
  };

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
        <Image
          source={require('@/assets/images/reversed-icon.png')}
          style={styles.headerBarLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Log Your Waste</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trophy-outline" size={32} color={colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>
              {score?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={32} color={colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>
              {logs.length}
            </Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/waste/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Waste Log</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Log History</Text>

        <View style={styles.logsContainer}>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TouchableOpacity
                key={log.id}
                style={styles.logCard}
                onPress={() => router.push(`/waste/${log.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logTitleContainer}>
                    <Ionicons name="leaf-outline" size={20} color={colors.primary} style={styles.logIcon} />
                    <Text style={styles.logTitle}>{log.sub_category_name}</Text>
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.logScore}>+{log.score.toFixed(1)} <MaterialCommunityIcons name="star-four-points-outline" size={16} color={colors.primary} /></Text>
                  </View>
                </View>
                <View style={styles.logDetails}>
                  <Text style={styles.logQuantity}>
                    Quantity: {log.quantity} {getSubCategoryUnit(log.sub_category)}
                  </Text>
                  <Text style={styles.logDate}>
                    {new Date(log.disposal_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                {log.disposal_location && (
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.locationText}>
                      {log.disposal_location}
                    </Text>
                  </View>
                )}
                <View style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.primary} />
              <Text style={styles.emptyStateText}>
                No waste logs yet. Start tracking your waste!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}