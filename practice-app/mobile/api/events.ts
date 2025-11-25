import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";
import { fetchAllPages, parseJson } from "./utils";

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string | null;
  creator: number;
  creator_username: string;
  participants_count: number;
  likes_count: number;
  i_am_participating: boolean;
  i_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  date: string;
  image?: string | null; // Can be a file URI or null
}

export interface LikeResponse {
  likes_count: number;
  i_liked: boolean;
}

export interface ParticipateResponse {
  participants_count: number;
  i_am_participating: boolean;
}

export const getEvents = async (): Promise<Event[]> => {
  try {
    const events = await fetchAllPages<Event>(API_ENDPOINTS.EVENTS.LIST);
    return events;
  } catch (error) {
    console.error("Failed to get events", error);
    throw error;
  }
};

export const getEventById = async (id: number): Promise<Event> => {
  const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.EVENTS.BY_ID(id));
  return parseJson<Event>(response, "Failed to load event details.");
};

export const createEvent = async (eventData: CreateEventData): Promise<Event> => {
  // Backend expects multipart/form-data
  const formData = new FormData();
  formData.append('title', eventData.title);
  formData.append('description', eventData.description);
  formData.append('location', eventData.location);
  formData.append('date', eventData.date);
  
  // Handle image upload - only local files are supported
  if (eventData.image && eventData.image.trim() !== '') {
    // Check if it's a local file URI
    if (eventData.image.startsWith('file://') || eventData.image.startsWith('content://') || eventData.image.startsWith('ph://')) {
      // It's a local file - create a file object for upload
      const filename = eventData.image.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: eventData.image,
        type: type,
        name: filename,
      } as any);
    }
  }

  const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.EVENTS.CREATE, {
    method: 'POST',
    // Don't set Content-Type header - fetch will set it with boundary for FormData
    body: formData,
  });
  return parseJson<Event>(response, "Failed to create event.");
};

export const likeEvent = async (id: number): Promise<LikeResponse> => {
  const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.EVENTS.LIKE(id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJson<LikeResponse>(response, "Failed to like/unlike event.");
};

export const participateEvent = async (id: number): Promise<ParticipateResponse> => {
  const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.EVENTS.PARTICIPATE(id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJson<ParticipateResponse>(response, "Failed to participate/unparticipate in event.");
};

