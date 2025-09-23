import TokenManager from '@/app/tokenManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, View } from 'react-native';

interface EndpointTestResult {
  endpoint: string;
  status: number;
  success: boolean;
  data?: any;
  error?: string;
}

export default function AdminEndpointsTest() {
  const [results, setResults] = useState<EndpointTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingEndpoints, setIsTestingEndpoints] = useState(false);

  useEffect(() => {
    // Initial basic profile check
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE);
      
      let result: EndpointTestResult = {
        endpoint: API_ENDPOINTS.USER.PROFILE,
        status: response.status,
        success: response.ok
      };
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 User Profile:', data);
        console.log('🔑 User Role:', data.role);
        result.data = data;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch profile:', errorText);
        result.error = errorText;
      }
      
      setResults([result]);
    } catch (error) {
      console.error('🛑 Error in profile fetch:', error);
      setResults([{
        endpoint: API_ENDPOINTS.USER.PROFILE,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllAdminEndpoints = async () => {
    try {
      setIsTestingEndpoints(true);
      const newResults: EndpointTestResult[] = [...results];
      
      // Manually test all admin endpoints
      const endpointsToTest = [
        API_ENDPOINTS.USER.USERS,
        API_ENDPOINTS.WASTE.ADMIN.CATEGORY_REQUESTS
      ];
      
      for (const endpoint of endpointsToTest) {
        try {
          console.log(`🔍 Testing endpoint: ${endpoint}`);
          const response = await TokenManager.authenticatedFetch(endpoint);
          
          let result: EndpointTestResult = {
            endpoint,
            status: response.status,
            success: response.ok
          };
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Endpoint ${endpoint} success:`, data);
            result.data = data;
          } else {
            const errorText = await response.text();
            console.error(`❌ Endpoint ${endpoint} failed:`, errorText);
            result.error = errorText;
          }
          
          newResults.push(result);
        } catch (error) {
          console.error(`🛑 Error testing ${endpoint}:`, error);
          newResults.push({
            endpoint,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      setResults(newResults);
    } catch (error) {
      console.error('Error in overall endpoint testing:', error);
    } finally {
      setIsTestingEndpoints(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <ThemedText style={styles.loadingText}>Checking user profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText style={styles.title}>Admin Endpoints Test</ThemedText>
        
        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>API Configuration</ThemedText>
          <ThemedText style={styles.infoText}>Base URL: {API_BASE_URL}</ThemedText>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title={isTestingEndpoints ? "Testing..." : "Test All Admin Endpoints"}
            onPress={testAllAdminEndpoints}
            color="#2E7D32"
            disabled={isTestingEndpoints}
          />
        </View>
        
        <ThemedText style={styles.sectionTitle}>Test Results</ThemedText>
        
        {results.map((result, index) => (
          <View key={index} style={[
            styles.resultCard,
            result.success ? styles.successCard : styles.errorCard
          ]}>
            <ThemedText style={styles.endpointText}>{result.endpoint}</ThemedText>
            <ThemedText style={styles.statusText}>
              Status: {result.status} ({result.success ? 'Success' : 'Failed'})
            </ThemedText>
            
            {result.data && (
              <View style={styles.dataContainer}>
                <ThemedText style={styles.dataLabel}>Response Data:</ThemedText>
                <ScrollView style={styles.codeBlockScroll} horizontal={true}>
                  <ThemedText style={styles.codeBlock}>
                    {JSON.stringify(result.data, null, 2)}
                  </ThemedText>
                </ScrollView>
              </View>
            )}
            
            {result.error && (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorLabel}>Error:</ThemedText>
                <ThemedText style={styles.errorText}>{result.error}</ThemedText>
              </View>
            )}
          </View>
        ))}
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
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
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
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  resultCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  endpointText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 8,
  },
  dataContainer: {
    marginTop: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  codeBlockScroll: {
    maxHeight: 200,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  errorContainer: {
    marginTop: 8,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D32F2F',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
  },
}); 