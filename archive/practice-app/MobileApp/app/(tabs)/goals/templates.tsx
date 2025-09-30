import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

interface GoalTemplate {
  id: number;
  name: string;
  description: string;
  category_name: string;
  target: number;
  timeframe: string;
}

export default function GoalTemplatesScreen() {
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const router = useRouter();

  const fetchTemplates = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.TEMPLATES);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.results);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateFromTemplate = async (template: GoalTemplate) => {
    setCreatingId(template.id);
    try {
      const response = await TokenManager.authenticatedFetch(
        API_ENDPOINTS.GOALS.CREATE_FROM_TEMPLATE(template.id),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
      if (response.ok) {
        Alert.alert('Success', 'Goal created from template!');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to create goal.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal.');
    } finally {
      setCreatingId(null);
    }
  };

  const renderTemplate = ({ item }: { item: GoalTemplate }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <ThemedText style={styles.templateTitle}>{item.name}</ThemedText>
        <ThemedText style={styles.category}>{item.category_name}</ThemedText>
      </View>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
      <View style={styles.templateDetails}>
        <Ionicons name="calendar-outline" size={16} color="#2E7D32" />
        <ThemedText style={styles.detailText}>{item.timeframe}</ThemedText>
        <Ionicons name="flag-outline" size={16} color="#2E7D32" style={{ marginLeft: 12 }} />
        <ThemedText style={styles.detailText}>{item.target} kg</ThemedText>
      </View>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => handleCreateFromTemplate(item)}
        disabled={creatingId === item.id}
      >
        <ThemedText style={styles.createButtonText}>
          {creatingId === item.id ? 'Creating...' : 'Create Goal'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Goal Templates</ThemedText>
        <View style={styles.placeholder} />
      </View>
      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  list: {
    padding: 20,
  },
  templateCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  templateDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 4,
  },
  createButton: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 