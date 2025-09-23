import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, View } from 'react-native';

interface DiagnosticInfo {
  userRole: string | null;
  apiBaseUrl: string;
  apiEndpoints: any;
  rawProfileData: any;
}

export default function AdminDiagnostics() {
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDiagnosticInfo() {
      try {
        setIsLoading(true);
        
        // Get user profile
        const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE);
        let profileData = null;
        let userRole = null;
        
        if (response.ok) {
          profileData = await response.json();
          userRole = profileData?.role || null;
        } else {
          setError(`API Error: ${response.status} ${response.statusText}`);
        }
        
        setDiagnosticInfo({
          userRole,
          apiBaseUrl: API_BASE_URL,
          apiEndpoints: {
            profile: API_ENDPOINTS.USER.PROFILE,
            adminCategoryRequests: API_ENDPOINTS.WASTE.ADMIN.CATEGORY_REQUESTS,
          },
          rawProfileData: profileData,
        });
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDiagnosticInfo();
  }, []);

  const tryAdminNavigations = () => {
    try {
      router.push('/admin');
    } catch (err) {
      setError(`Navigation Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const tryTabsAdminNavigations = () => {
    try {
      router.push('../admin');
    } catch (err) {
      setError(`Navigation Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <ThemedText style={styles.loadingText}>Loading diagnostic data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText style={styles.title}>Admin Diagnostics</ThemedText>
        
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}
        
        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>User Role</ThemedText>
          <ThemedText style={styles.infoText}>
            {diagnosticInfo?.userRole || 'No role detected'}
          </ThemedText>
        </View>
        
        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>API Configuration</ThemedText>
          <ThemedText style={styles.infoText}>
            Base URL: {diagnosticInfo?.apiBaseUrl}
          </ThemedText>
        </View>
        
        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>Raw Profile Data</ThemedText>
          <ThemedText style={styles.codeBlock}>
            {JSON.stringify(diagnosticInfo?.rawProfileData, null, 2)}
          </ThemedText>
        </View>
        
        <View style={styles.actionsContainer}>
          <ThemedText style={styles.sectionTitle}>Navigation Tests</ThemedText>
          <View style={styles.buttonContainer}>
            <Button
              title="Try /admin navigation"
              onPress={tryAdminNavigations}
              color="#2E7D32"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Try /(tabs)/admin navigation"
              onPress={tryTabsAdminNavigations}
              color="#FF9800"
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
  },
  infoSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: 14,
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 4,
  },
  actionsContainer: {
    marginBottom: 32,
  },
  buttonContainer: {
    marginBottom: 16,
  },
}); 