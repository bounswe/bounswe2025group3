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

    // Handle empty 200/204 responses gracefully
    const rawText = await response.text();
    if (!rawText) {
      if (!response.ok) throw new Error("Failed to load badges.");
      return [];
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      if (!response.ok) throw new Error("Failed to load badges.");
      return [];
    }

    if (!response.ok) {
      throw buildError(parsed, "Failed to load badges.");
    }

    return extractBadgeList(parsed);
  } catch (error) {
    console.error("Failed to fetch badges", error);
    throw error;
  }
};

