import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    bio: string;
    city: string;
    country: string;
    role: string;
    date_joined: string;
    notifications_enabled: boolean;
}

export interface UpdateProfileData {
    first_name?: string;
    last_name?: string;
    bio?: string;
    city?: string;
    country?: string;
}

const parseJson = async <T>(response: Response, fallbackMessage: string): Promise<T> => {
    let data: any = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message =
            (data && (data.detail || data.message || data.error)) ||
            fallbackMessage ||
            "Request failed";
        throw new Error(typeof message === "string" ? message : fallbackMessage);
    }

    return data as T;
};

export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE);
    return parseJson<UserProfile>(response, "Failed to load user profile.");
};

export const updateUserProfile = async (profileData: UpdateProfileData): Promise<UserProfile> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
    });
    return parseJson<UserProfile>(response, "Failed to update user profile.");
};

