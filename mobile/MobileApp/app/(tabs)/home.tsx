import { StyleSheet, ScrollView, View, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Eco Feed</ThemedText>
      </View>
      <ScrollView style={styles.scrollView}>
        {/* Friend's Achievement */}
        <View style={styles.feedItem}>
          <View style={styles.feedHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>S</ThemedText>
              </View>
            </View>
            <View style={styles.headerText}>
              <ThemedText style={styles.username}>Sarah</ThemedText>
              <ThemedText style={styles.timestamp}>2 hours ago</ThemedText>
            </View>
          </View>
          <View style={styles.achievementCard}>
            <ThemedText style={styles.achievementTitle}>🏆 New Achievement Unlocked!</ThemedText>
            <ThemedText style={styles.achievementText}>
              Reached 100kg of recycled waste! Keep up the great work!
            </ThemedText>
          </View>
        </View>

        {/* Challenge Notification */}
        <View style={styles.feedItem}>
          <View style={styles.feedHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>C</ThemedText>
              </View>
            </View>
            <View style={styles.headerText}>
              <ThemedText style={styles.username}>Community Challenge</ThemedText>
              <ThemedText style={styles.timestamp}>5 hours ago</ThemedText>
            </View>
          </View>
          <View style={styles.challengeCard}>
            <ThemedText style={styles.challengeTitle}>🌱 Weekly Challenge</ThemedText>
            <ThemedText style={styles.challengeText}>
              This week's challenge: Reduce plastic waste by 50%. Join now and win eco-friendly prizes!
            </ThemedText>
          </View>
        </View>

        {/* Friend's Activity */}
        <View style={styles.feedItem}>
          <View style={styles.feedHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>M</ThemedText>
              </View>
            </View>
            <View style={styles.headerText}>
              <ThemedText style={styles.username}>Mike</ThemedText>
              <ThemedText style={styles.timestamp}>1 day ago</ThemedText>
            </View>
          </View>
          <View style={styles.activityCard}>
            <ThemedText style={styles.activityText}>
              Just completed the "Zero Waste Week" challenge! 🎉
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#cbe4ca',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  feedItem: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  achievementCard: {
    padding: 16,
    backgroundColor: '#f0f7f0',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 16,
    lineHeight: 24,
  },
  challengeCard: {
    padding: 16,
    backgroundColor: '#e8f5e9',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  challengeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  activityCard: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  activityText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
