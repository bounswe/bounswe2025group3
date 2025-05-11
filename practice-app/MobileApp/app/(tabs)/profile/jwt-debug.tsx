import TokenManager from "@/app/tokenManager";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, ActivityIndicator, View } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function JWTDebugScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getTokens() {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        setAccessToken(token);
        
        if (token) {
          // Basic JWT decoding (payload only)
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = parts[1];
            const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            setDecodedToken(JSON.parse(decodedPayload));
          }
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    getTokens();
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedText style={styles.title}>JWT Token Debug</ThemedText>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Access Token</ThemedText>
          <ThemedText style={styles.tokenText}>
            {accessToken ? accessToken.substring(0, 20) + "..." : "No token found"}
          </ThemedText>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Decoded Payload</ThemedText>
          {decodedToken ? (
            <ScrollView style={styles.payloadContainer}>
              {Object.entries(decodedToken).map(([key, value]) => (
                <View key={key} style={styles.payloadRow}>
                  <ThemedText style={styles.payloadKey}>{key}:</ThemedText>
                  <ThemedText style={styles.payloadValue}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ThemedText style={styles.notFoundText}>Could not decode token</ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  tokenText: {
    fontFamily: "monospace",
    fontSize: 14,
  },
  payloadContainer: {
    maxHeight: 400,
  },
  payloadRow: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  payloadKey: {
    fontWeight: "bold",
    marginRight: 8,
  },
  payloadValue: {
    fontFamily: "monospace",
    flex: 1,
  },
  notFoundText: {
    color: "#666",
    fontStyle: "italic",
  },
}); 