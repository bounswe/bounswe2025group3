import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { fetchEnvironmentalNews } from '@/services/newsService';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export function EnvironmentalNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNews = async () => {
    try {
      const articles = await fetchEnvironmentalNews();
      setNews(articles);
    } catch (err) {
      console.error('Error loading news:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNews();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </ThemedView>
    );
  }

  if (news.length === 0) {
    return null;
  }

  const article = news[0];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Latest Environmental News</ThemedText>
        <TouchableOpacity 
          onPress={handleRefresh} 
          style={[styles.refreshButton, isRefreshing && styles.refreshButtonDisabled]}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
            <Ionicons name="refresh" size={24} color="#2E7D32" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.newsCard}
        onPress={() => Linking.openURL(article.url)}
      >
        <View style={styles.newsContent}>
          <ThemedText style={styles.newsTitle}>{article.title}</ThemedText>
          <ThemedText style={styles.newsDescription} numberOfLines={2}>
            {article.description}
          </ThemedText>
          <View style={styles.newsFooter}>
            <ThemedText style={styles.newsSource}>{article.source.name}</ThemedText>
            <ThemedText style={styles.newsDate}>
              {formatDate(article.publishedAt)}
            </ThemedText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#2E7D32" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  newsContent: {
    flex: 1,
    marginRight: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
  },
}); 