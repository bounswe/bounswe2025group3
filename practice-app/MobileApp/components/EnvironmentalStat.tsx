import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getRandomEnvironmentalStat } from '../services/environmentalStatsService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EnvironmentalStatProps {
  onRefresh?: () => void;
}

const EnvironmentalStat: React.FC<EnvironmentalStatProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stat, setStat] = useState<{
    title: string;
    value: string;
    unit: string;
    statement: string;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRandomEnvironmentalStat();
      setStat(data);
    } catch (err) {
      setError('Failed to load environmental stat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading environmental data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stat) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No environmental data available</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Choose an appropriate icon based on the stat title
  let iconName = "earth";
  if (stat.title.includes("CO2") || stat.title.includes("CO₂")) {
    iconName = "molecule-co2";
  } else if (stat.title.includes("Arctic") || stat.title.includes("Ice")) {
    iconName = "snowflake";
  } else if (stat.title.includes("Temperature")) {
    iconName = "thermometer";
  } else if (stat.title.includes("Plastic")) {
    iconName = "bottle-soda-classic";
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name={iconName as any} size={24} color="#4CAF50" />
        <Text style={styles.title}>{stat.title}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {stat.value} <Text style={styles.unit}>{stat.unit}</Text>
        </Text>
      </View>
      
      <Text style={styles.statement}>{stat.statement}</Text>
      
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
        <Text style={styles.refreshButtonText}>Get Another Stat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333333',
  },
  valueContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  unit: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#666666',
  },
  statement: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555555',
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginVertical: 12,
  },
});

export default EnvironmentalStat; 