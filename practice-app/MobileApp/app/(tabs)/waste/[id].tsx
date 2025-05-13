import TokenManager from '@/app/tokenManager';
import CustomAlert from '@/components/CustomAlert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface WasteLog {
  id: number;
  sub_category_name: string;
  quantity: string;
  date_logged: string;
  score: number;
  disposal_location: string | null;
  disposal_date?: string;
}

export default function WasteLogDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [log, setLog] = useState<WasteLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedDisposalDate, setEditedDisposalDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchLogDetails();
  }, [id]);

  const fetchLogDetails = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(`${API_ENDPOINTS.WASTE.LOGS}${id}/`);
      
      if (response.ok) {
        const data = await response.json();
        setLog(data);
        setEditedQuantity(data.quantity);
        setEditedLocation(data.disposal_location || '');
        setEditedDisposalDate(data.disposal_date || '');
      }
    } catch (error) {
      console.error('Error fetching waste log details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleDelete = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(`${API_ENDPOINTS.WASTE.LOGS}${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showAlert('Success', 'Waste log deleted successfully', 'success');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        showAlert('Error', 'Failed to delete waste log');
      }
    } catch (error) {
      showAlert('Error', 'Failed to delete waste log');
    }
  };

  const handleSave = async () => {
    try {
      const response = await TokenManager.authenticatedFetch(`${API_ENDPOINTS.WASTE.LOGS}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: editedQuantity,
          disposal_location: editedLocation,
          disposal_date: editedDisposalDate,
        }),
      });

      if (response.ok) {
        showAlert('Success', 'Waste log updated successfully', 'success');
        setIsEditing(false);
        fetchLogDetails(); // Refresh the data
      } else {
        showAlert('Error', 'Failed to update waste log');
      }
    } catch (error) {
      showAlert('Error', 'Failed to update waste log');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedQuantity(log?.quantity || '');
    setEditedLocation(log?.disposal_location || '');
    setEditedDisposalDate(log?.disposal_date || '');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!log) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Waste log not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>{log.sub_category_name}</ThemedText>
            <ThemedText style={styles.score}>+{log.score} pts</ThemedText>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <ThemedText style={styles.label}>Quantity</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedQuantity}
                  onChangeText={setEditedQuantity}
                  keyboardType="decimal-pad"
                  placeholder="Enter quantity"
                />
              ) : (
                <ThemedText style={styles.value}>{log.quantity}</ThemedText>
              )}
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.label}>Date Logged</ThemedText>
              <ThemedText style={styles.value}>
                {new Date(log.date_logged).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.label}>Disposal Date</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedDisposalDate}
                  onChangeText={setEditedDisposalDate}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <ThemedText style={styles.value}>
                  {log.disposal_date ? new Date(log.disposal_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not specified'}
                </ThemedText>
              )}
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.label}>Location</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedLocation}
                  onChangeText={setEditedLocation}
                  placeholder="Enter location"
                />
              ) : (
                <ThemedText style={styles.value}>{log.disposal_location || 'Not specified'}</ThemedText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>Save</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Ionicons name="close" size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>Delete</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  score: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '500',
  },
  details: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    width: 150,
    fontSize: 16,
    backgroundColor: 'white',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#1976D2',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 