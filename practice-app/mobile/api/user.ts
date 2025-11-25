import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";
import { parseJson } from "./utils";

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

