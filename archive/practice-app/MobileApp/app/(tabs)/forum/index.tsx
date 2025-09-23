import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export default function ForumScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="chatbubbles-outline" size={64} color="#666" />
        <ThemedText style={styles.title}>Forum Coming Soon</ThemedText>
        <ThemedText style={styles.description}>
          The forum feature is currently under development. Stay tuned for updates!
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
 