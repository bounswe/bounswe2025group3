import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEventById, Event } from '@/api/events';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/constants/api';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const colors = useColors();
  const { t } = useTranslation();

  const customBlue = (colors as any).blue || colors.primary; 

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    headerBar: { height: "7%", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
    headerTitle: { fontSize: 20, fontWeight: '600', color: colors.text, position: 'absolute', left: 0, right: 0, textAlign: 'center', zIndex: -1 },
    headerAction: { padding: 4 },
    contentContainer: { padding: 16, paddingBottom: 40, gap: 16 },
    imageContainer: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.cb1, marginBottom: 16 },
    eventImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cb2 },
    card: { backgroundColor: colors.cb1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borders },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    eventTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, flex: 1, marginRight: 8 },
    cardSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16 },
    statusUpcoming: { backgroundColor: colors.primary },
    statusPast: { backgroundColor: colors.textSecondary },
    statusText: { fontSize: 12, fontWeight: 'bold', color: 'white' },
    detailItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.borders, gap: 12, minHeight: 50 },
    detailLabel: { fontSize: 16, color: colors.textSecondary },
    detailValue: { fontSize: 16, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
    descriptionText: { fontSize: 16, color: colors.text, lineHeight: 24, marginTop: 8 },
    
    actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 16 },
    actionButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, minHeight: 50 },
    
    likeButton: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary },
    likeButtonActive: { backgroundColor: '#FF3366', borderColor: '#FF3366' },
    likeButtonText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
    likeButtonTextActive: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    
    participateButtonActiveGradient: {flex: 1, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', minHeight: 50},
    participateButtonInactive: {backgroundColor: colors.cb1, borderWidth: 1, borderColor: customBlue,},
    participateButtonText: { color: customBlue, fontWeight: 'bold', fontSize: 16 },
    
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.borders, marginTop: 16 },
    statItem: { alignItems: 'center', gap: 4 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    statLabel: { fontSize: 12, color: colors.textSecondary },
  });

  const isEventUpcoming = (eventDate: string): boolean => {
    const now = new Date();
    const event = new Date(eventDate);
    return event >= now;
  };

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
      const eventData = await getEventById(Number(id));
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert("Error", "Failed to load event details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEventDetails();
  }, [id]);

  if (isLoading && !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Event not found</Text>
      </View>
    );
  }

  const upcoming = isEventUpcoming(event.date);
  const eventDate = new Date(event.date);
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerAction}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={
              event.image && event.image.trim() !== ''
                ? { 
                    uri: event.image.startsWith('http') 
                      ? event.image 
                      : `${API_BASE_URL}${event.image}` 
                  }
                : require('@/assets/images/default-event.jpeg')
            }
            style={styles.eventImage}
            onError={(error) => {
              console.error('Image load error:', error);
            }}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={[styles.statusBadge, upcoming ? styles.statusUpcoming : styles.statusPast]}>
              <Text style={styles.statusText}>{upcoming ? 'Upcoming' : 'Past'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={22} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{event.location}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {event.creator_username && (
            <View style={styles.detailItem}>
              <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Created by</Text>
              <Text style={styles.detailValue}>{event.creator_username}</Text>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{event.participants_count}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{event.likes_count}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}