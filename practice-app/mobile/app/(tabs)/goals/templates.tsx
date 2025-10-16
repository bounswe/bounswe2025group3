import { useColors } from '@/constants/colors';
import tokenManager from '@/services/tokenManager';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  id: number;
}
interface SubCategory {
  id: number;
  name: string;
  unit: string;
}
interface GoalTemplate { 
  id: number; 
  name: string; 
  description: string; 
  category_name: string; 
  target: number; 
  timeframe: string; 
}

const fetchAllPages = async <T,>(initialUrl: string): Promise<T[]> => {
    let results: T[] = [];
    let nextUrl: string | null = initialUrl;
    while (nextUrl) {
        try {
            const response = await tokenManager.authenticatedFetch(nextUrl);
            if (!response.ok) { break; }
            const data = await response.json();
            results = results.concat(data.results);
            if (data.next) {
                const nextURLObject = new URL(data.next);
                const relativePath = nextURLObject.pathname.startsWith('/api') ? nextURLObject.pathname.substring(4) : nextURLObject.pathname;
                nextUrl = relativePath + nextURLObject.search;
            } else { nextUrl = null; }
        } catch (error) { console.error('Error during pagination fetch:', error); break; }
    }
    return results;
};

export default function GoalTemplatesScreen() {
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const colors = useColors();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { height: "7%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.primary},
    headerButton: { padding: 4},
    headerTitle: { marginLeft: "12%",fontSize: 24, fontWeight: 600, color: colors.primary },
    placeholder: { width: 32 },
    list: { padding: 16 },
    templateCard: { backgroundColor: colors.cb1, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: colors.borders },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    templateTitle: { fontSize: 18, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
    categoryBadge: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    categoryBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    description: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 16 },
    detailsContainer: { flexDirection: 'row', gap: 24, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.borders },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 14, color: colors.text, fontWeight: '500' },
    createButton: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
    createButtonDisabled: { backgroundColor: colors.borders },
    createButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    emptyText: { fontSize: 16, textAlign: 'center', color: colors.textSecondary, lineHeight: 24 },
  });

  const fetchData = async () => {
    try {
      const [templateData, subCatData, userData] = await Promise.all([
        fetchAllPages<GoalTemplate>("/v1/goals/templates/"),
        fetchAllPages<SubCategory>("/v1/waste/subcategories/"),
        tokenManager.authenticatedFetch("/v1/auth/user/").then(res => res.ok ? res.json() : null)
      ]);
      setTemplates(templateData);
      setSubcategories(subCatData);
      if (userData) setUserProfile(userData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateFromTemplate = async (template: GoalTemplate) => {
    setCreatingId(template.id);
    const subcategory = subcategories.find(sub => sub.name === template.category_name);
    if (!subcategory || !userProfile) {
      Alert.alert('Error', 'Required user or category data is missing. Cannot create goal.');
      setCreatingId(null);
      return;
    }

    const requestBody = {
      user: userProfile.id,
      category_id: subcategory.id,
      timeframe: template.timeframe,
      target: template.target,
      start_date: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await tokenManager.authenticatedFetch(`/v1/goals/templates/${template.id}/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        Alert.alert('Success', 'Goal created successfully from the template!');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to create goal.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setCreatingId(null);
    }
  };

  const renderTemplate = ({ item }: { item: GoalTemplate }) => {
    const relatedSubcategory = subcategories.find(sub => sub.name === item.category_name);
    const unit = relatedSubcategory ? relatedSubcategory.unit : '...';

    return (
      <View style={styles.templateCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.templateTitle}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category_name}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.detailText}>{item.timeframe}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="flag-outline" size={18} color={colors.primary} />
            <Text style={styles.detailText}>{item.target} {unit}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.createButton, creatingId !== null && styles.createButtonDisabled]} 
          onPress={() => handleCreateFromTemplate(item)} 
          disabled={creatingId !== null}
        >
          {creatingId === item.id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.createButtonText}>Use This Template</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Templates</Text>
        <View style={styles.placeholder} />
      </View>

      {templates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={64} color={colors.primary} />
          <Text style={styles.emptyTitle}>No Templates Found</Text>
          <Text style={styles.emptyText}>There are currently no goal templates available.</Text>
        </View>
      ) : (
        <FlatList 
            data={templates} 
            renderItem={renderTemplate} 
            keyExtractor={(item) => item.id.toString()} 
            contentContainerStyle={styles.list} 
        />
      )}
    </SafeAreaView>
  );
}
