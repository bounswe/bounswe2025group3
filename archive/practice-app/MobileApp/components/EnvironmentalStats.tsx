import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import EnvironmentalStat from './EnvironmentalStat';

const EnvironmentalStats: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Environmental Statistics</Text>
        
        <Text style={styles.description}>
          These real-time environmental statistics show the current state of our planet.
          Data is sourced from global monitoring systems via the Global Warming API.
        </Text>
        
        <EnvironmentalStat />
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why This Matters</Text>
          <Text style={styles.infoText}>
            Environmental data helps us understand the impact of human activities on our planet.
            By monitoring key indicators like greenhouse gas levels, global temperature changes,
            and arctic ice coverage, scientists can track climate change and inform policy decisions.
          </Text>
          
          <Text style={styles.infoTitle}>Take Action</Text>
          <Text style={styles.infoText}>
            Individual actions can make a difference. Consider reducing your carbon footprint by:
          </Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Using public transportation or carpooling</Text>
            <Text style={styles.bulletPoint}>• Reducing meat consumption</Text>
            <Text style={styles.bulletPoint}>• Minimizing single-use plastics</Text>
            <Text style={styles.bulletPoint}>• Supporting renewable energy solutions</Text>
            <Text style={styles.bulletPoint}>• Advocating for climate-friendly policies</Text>
          </View>
          
          <Text style={styles.sourceText}>
            Data provided by{' '}
            <Text 
              style={styles.link}
              onPress={() => Linking.openURL('https://global-warming.org/')}
            >
              global-warming.org
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
  },
  sourceText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 16,
    textAlign: 'center',
  },
  link: {
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
});

export default EnvironmentalStats; 