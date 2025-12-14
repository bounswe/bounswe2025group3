import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";
import { parseJson } from "./utils";

export interface Notification {
  id: number;
  notification_type: string;
  event?: number;
  event_details?: {
    id: number;
    title: string;
  };
  is_read: boolean;
  created_at: string;
  message: string;
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export const getNotifications = async (page: number = 1): Promise<NotificationListResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  
  const endpoint = `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`;
  const response = await tokenManager.authenticatedFetch(endpoint);
  return parseJson<NotificationListResponse>(response, "Failed to load notifications.");
};

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const params = new URLSearchParams();
  params.append('is_read', 'false');
  
  const endpoint = `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`;
  const response = await tokenManager.authenticatedFetch(endpoint);
  const data = await parseJson<NotificationListResponse>(response, "Failed to load unread notifications.");
  return data.results || [];
};

export const markNotificationAsRead = async (id: number): Promise<string> => {
  const response = await tokenManager.authenticatedFetch(
    API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const data = await parseJson<string>(response, "Failed to mark notification as read.");
  return data;
};

export const markAllNotificationsAsRead = async (): Promise<string> => {
  const response = await tokenManager.authenticatedFetch(
    API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const data = await parseJson<string>(response, "Failed to mark all notifications as read.");
  return data;
};

