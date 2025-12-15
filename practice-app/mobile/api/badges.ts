import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";

export interface BadgeInfo {
  id: number | string;
  name: string;
  code?: string;
  icon?: string;
  description?: string;
  [key: string]: unknown;
}

export interface Badge {
  badge: BadgeInfo;
  earned_at?: string;
  achieved_at?: string;
  is_earned?: boolean;
  earned?: boolean;  // Backend sends 'earned', not 'is_earned'
  progress?: number;
  target?: number;
  // For backward compatibility with flat structure
  id?: number | string;
  name?: string;
  description?: string;
  icon?: string;
  icon_url?: string;
  image?: string;
  image_url?: string;
  [key: string]: unknown;
}

const extractBadgeList = (data: any): Badge[] => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
};

const buildError = (data: any, fallback: string) => {
  const detail =
    (data && (data.detail || data.message || data.error)) || fallback;
  const error = new Error(typeof detail === "string" ? detail : fallback);
  return error;
};

export const getMyBadges = async (): Promise<Badge[]> => {
  try {
    const response = await tokenManager.authenticatedFetch(
      API_ENDPOINTS.REWARDS.BADGES_ME
    );

    console.log(`[Badges] Response status: ${response.status}`);

    // Handle empty 200/204 responses gracefully
    const rawText = await response.text();
    if (!rawText) {
      if (!response.ok) {
        console.warn(`[Badges] Empty response with status ${response.status}. Badges may not be available on this backend.`);
        return []; // Fail gracefully
      }
      console.log('[Badges] Empty 200/204 response, returning empty array');
      return [];
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
      console.log(`[Badges] Parsed response:`, JSON.stringify(parsed).substring(0, 200));
    } catch {
      if (!response.ok) {
        console.warn(`[Badges] Invalid JSON with status ${response.status}. Badges may not be available on this backend.`);
        return []; // Fail gracefully
      }
      console.warn('[Badges] Invalid JSON in 200 response');
      return [];
    }

    if (!response.ok) {
      console.warn(`[Badges] Error status ${response.status}:`, parsed);
      return []; // Fail gracefully instead of throwing
    }

    const badges = extractBadgeList(parsed);
    console.log(`[Badges] Successfully loaded ${badges.length} badges`);
    return badges;
  } catch (error) {
    // If authentication error or network error, silently fail
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('No access token') || 
        errorMessage.includes('Session expired') || 
        errorMessage.includes('Authentication')) {
      return [];
    }
    console.warn("[Badges] Error fetching badges:", error);
    return []; // Fail gracefully
  }
};

