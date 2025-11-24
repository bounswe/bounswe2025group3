import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { getEvents, Event, likeEvent, participateEvent } from '@/api/events';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/constants/api';
import { LinearGradient } from 'expo-linear-gradient';

type FilterStatus = 'All' | 'Upcoming' | 'Past';

const isEventUpcoming = (eventDate: string): boolean => {
  const now = new Date();
  const event = new Date(eventDate);
  return event >= now;
};

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  
  const router = useRouter();
  const colors = useColors();
  const isInitialLoad = useRef(true);
  const { t } = useTranslation();

  const customBlue = (colors as any).blue || colors.primary;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    headerBar: { height: "7%", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: "4%", paddingTop: 0, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerBarLogo: { width: 52, height: 52 },
    headerTitle: { fontSize: 24, fontWeight: '600', color: colors.primary, marginLeft: "5%" },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    addButton: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2 },
    list: { padding: 10, paddingBottom: 40 },
    eventItem: { backgroundColor: colors.cb1, borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: colors.borders, overflow: 'hidden' },
    eventImageContainer: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.cb2 },
    eventImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    eventContent: { padding: 16 },
    eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    eventTitle: { fontSize: 18, fontWeight: '600', color: colors.text, flex: 1 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginLeft: 8 },
    statusUpcoming: { backgroundColor: colors.primary },
    statusPast: { backgroundColor: colors.textSecondary },
    statusText: { fontSize: 12, fontWeight: '500', color: 'white' },
    eventDetails: { flexDirection: 'row', gap: 20, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' },
    eventInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    eventInfoText: { fontSize: 14, color: colors.textSecondary },
    eventDescription: { fontSize: 14, color: colors.textSecondary, marginBottom: 12, lineHeight: 20 },
    dateContainer: { borderTopWidth: 1, borderTopColor: colors.borders, paddingTop: 12, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 13, color: colors.textSecondary },
    statsContainer: { flexDirection: 'row', gap: 16, marginTop: 8 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 13, color: colors.textSecondary },
    
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borders, gap: 16 },
    participateButtonContainer: { flex: 3, borderRadius: 12, overflow: 'hidden' },
    participateButton: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, minHeight: 44, borderRadius: 12},
    participateButtonInactive: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: customBlue },
    participateButtonText: { fontWeight: '700', fontSize: 14, color: customBlue },
    participateContentWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 100 },
    likeActionContainer: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
    likeButtonContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, minWidth: 60, justifyContent: 'flex-end' },
    likeButtonText: { fontWeight: '600', fontSize: 14, color: colors.textSecondary },
    
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    emptyText: { fontSize: 16, textAlign: 'center', color: colors.textSecondary, lineHeight: 24 },
    emptyButton: { marginTop: 16, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, elevation: 2 },
    emptyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    filterContainer: { paddingVertical: 10, paddingHorizontal: 10, backgroundColor: colors.background },
    filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary },
    activeFilterButton: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterButtonText: { color: colors.textSecondary, fontWeight: '500' },
    activeFilterButtonText: { color: 'white' },
  });

  const fetchEvents = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      if (showLoader) setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(false);
  }, []);

  useEffect(() => {
    fetchEvents(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isInitialLoad.current) {
        fetchEvents(false);
      } else {
        isInitialLoad.current = false;
      }
    }, [])
  );
  
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'All') {
      return events;
    }
    return events.filter(event => {
      const upcoming = isEventUpcoming(event.date);
      return activeFilter === 'Upcoming' ? upcoming : !upcoming;
    });
  }, [events, activeFilter]);


  const handleLike = async (eventId: number, currentLiked: boolean, currentLikes: number) => {
    
    const optimisticNewLikes = currentLiked ? currentLikes - 1 : currentLikes + 1;
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, likes_count: optimisticNewLikes, i_liked: !currentLiked }
          : event
      )
    );
    
    try {
      const response = await likeEvent(eventId);
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, likes_count: response.likes_count, i_liked: response.i_liked }
            : event
        )
      );
    } catch (error) {
      console.error('Error liking event:', error);
      Alert.alert("Error", "Failed to like/unlike event. Reverting status.");
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, likes_count: currentLikes, i_liked: currentLiked }
            : event
        )
      );
    }
  };

  const handleParticipate = async (eventId: number, currentParticipating: boolean, currentParticipants: number) => {
    
    const optimisticNewParticipants = currentParticipating ? currentParticipants - 1 : currentParticipants + 1;
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, participants_count: optimisticNewParticipants, i_am_participating: !currentParticipating }
          : event
      )
    );
    
    try {
      const response = await participateEvent(eventId);
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, participants_count: response.participants_count, i_am_participating: response.i_am_participating }
            : event
        )
      );
    } catch (error) {
      console.error('Error participating in event:', error);
      Alert.alert("Error", "Failed to participate/unparticipate in event. Reverting status.");
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, participants_count: currentParticipants, i_am_participating: currentParticipating }
            : event
        )
      );
    }
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const upcoming = isEventUpcoming(item.date);
    const eventDate = new Date(item.date);
    const isLiked = item.i_liked === true;
    const isParticipating = item.i_am_participating === true;
    
    const hasImage = item.image && item.image.trim() !== '';
    const imageUri = hasImage
      ? (item.image!.startsWith('http') ? item.image! : `${API_BASE_URL}${item.image}`)
      : null;
    
    return (
      <TouchableOpacity 
        style={styles.eventItem} 
        onPress={() => router.push({ pathname: "/events/[id]" as any, params: { id: item.id.toString() } })}
      >
        <View style={styles.eventImageContainer}>
          <Image 
            source={imageUri ? { uri: imageUri } : require('@/assets/images/default-event.jpeg')}
            style={styles.eventImage}
            onError={(error) => {
              console.error('Image load error:', error);
            }}
          />
        </View>
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.statusBadge, upcoming ? styles.statusUpcoming : styles.statusPast]}>
              <Text style={styles.statusText}>{upcoming ? 'Upcoming' : 'Past'}</Text>
            </View>
          </View>
          
          {item.description && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.eventDetails}>
            {item.location && (
              <View style={styles.eventInfo}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text style={styles.eventInfoText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.dateContainer}>
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.participants_count} participants</Text>
            </View>
            {item.creator_username && (
              <View style={styles.statItem}>
                <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.statText} numberOfLines={1}>{item.creator_username}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            
            <TouchableOpacity
              style={styles.participateButtonContainer}
              onPress={(e) => {
                e.stopPropagation();
                handleParticipate(item.id, isParticipating, item.participants_count);
              }}
            >
              {isParticipating ? (
                <LinearGradient
                    colors={['#24C6DC', '#514A9D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.participateButton}
                >
                    <View style={styles.participateContentWrapper}>
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={[styles.participateButtonText, { color: 'white' }]}>Participating</Text>
                    </View>
                </LinearGradient>
              ) : (
                <View style={[styles.participateButton, styles.participateButtonInactive]}>
                    <View style={styles.participateContentWrapper}>
                        <Text style={styles.participateButtonText}>Participate</Text>
                    </View>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.likeActionContainer}>
                <TouchableOpacity
                  style={styles.likeButtonContainer}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleLike(item.id, isLiked, item.likes_count);
                  }}
                >
                  <>
                     <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={26} 
                      color={isLiked ? "#FF3366" : colors.textSecondary} 
                     />
                     <Text style={[styles.likeButtonText, isLiked && { color: "#FF3366" }]}>
                       {item.likes_count}
                     </Text>
                  </>
                </TouchableOpacity>
            </View>

          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterBar = () => {
    const filters: FilterStatus[] = ['All', 'Upcoming', 'Past'];
    const filterLabels: Record<FilterStatus, string> = {
      'All': 'All',
      'Upcoming': 'Upcoming',
      'Past': 'Past'
    };
    return (
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter && styles.activeFilterButtonText,
              ]}>{filterLabels[filter]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerBar}>
        <View style={styles.headerContent}>
          <Image source={require('@/assets/images/reversed-icon.png')} style={styles.headerBarLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Events</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/events/add")}>
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {renderFilterBar()}
      {events.length === 0 ? (
        <ScrollView 
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.primary} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptyText}>Get started by creating your first event!</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/events/add")}>
              <Text style={styles.emptyButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No matching events</Text>
          <Text style={styles.emptyText}>
            No events found for the selected filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}