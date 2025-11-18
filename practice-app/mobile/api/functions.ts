import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";

export const fetchAllPages = async <T>(initialUrl: string): Promise<T[]> => {
    let results: T[] = [];
    let nextUrl: string | null = initialUrl;
  
    try {
      while (nextUrl) {
        const response = await tokenManager.authenticatedFetch(nextUrl);
        if (!response.ok) {
          throw new Error(`Pagination request failed with status ${response.status}`);
        }
  
        const data = await response.json();
  
        if (!data.results) {
          throw new Error("Response missing 'results' array — unexpected format.");
        }
        results = results.concat(data.results);
  
        if (data.next) {
            try {
              const nextURLObject = new URL(data.next);
              nextUrl = nextURLObject.pathname + nextURLObject.search;
            } catch {
              nextUrl = data.next;
            }
        } else {
          nextUrl = null;
        }
      }
  
      return results;
    } catch (error) {
      console.error("Error during paginated fetch:", error);
      throw error;
    }
};

export const getMyScore = async() => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.MY_SCORE);
        if (!response.ok) {
            throw new Error("getMyScore call failed");
        }
        const data = await response.json();
        console.log(data);
        return data.total_score;
    } catch (error) {
        console.error(error);
    }
}

export const getUserProfile = async() => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE);
        if (!response.ok) {
            throw new Error("getUserProfile call failed");
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
    }
}

export interface UpdateProfileData {
    first_name?: string;
    last_name?: string;
    bio?: string;
    city?: string;
    country?: string;
}

export const updateUserProfile = async (profileData: UpdateProfileData) => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.USER.PROFILE, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        if (!response.ok) {
            throw new Error("updateUserProfile call failed");
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export type Subcategory = {
    id: number;
    name: string;
    category: number;
    description: string;
    score_per_unit: string;
    unit: string;
    is_active: boolean;
};

export const getSubcategories = async (): Promise<Subcategory[]> => {
    try {
        const subcategories = await fetchAllPages<Subcategory>(API_ENDPOINTS.WASTE.SUBCATEGORIES);
        return subcategories;
    } catch (error) {
        console.error("Failed to get subcategories:", error);
        throw error;
    }
};

export interface Goal {
    id: number;
    category: Subcategory;
    timeframe: 'daily' | 'weekly' | 'monthly';
    target: number;
    progress: number;
    is_complete: boolean;
    created_at: string;
    start_date: string;
    status: string;
}

export const getGoals = async (): Promise<Goal[]> => {
    try {
        const goals = await fetchAllPages<Goal>(API_ENDPOINTS.GOALS.LIST);
        console.log(goals);
        return goals;
    } catch (error) {
        console.error("Failed to get goals", error);
        throw error;
    }
};

interface GoalTemplate { 
    id: number; 
    name: string; 
    description: string; 
    category_name: string; 
    target: number; 
    timeframe: string; 
}

export const getGoalTemplates = async (): Promise<GoalTemplate[]> => {
    try {
        const goalTemplates = await fetchAllPages<GoalTemplate>(API_ENDPOINTS.GOALS.TEMPLATES);
        return goalTemplates;
    } catch (error) {
        console.error("Failed to get goal templates:", error);
        throw error;
    }
};

export interface CreateGoalData {
    user: number;
    category_id: number;
    timeframe: 'daily' | 'weekly' | 'monthly';
    target: number;
    start_date: string;
    status?: string;
}

export const createGoal = async (goalData: CreateGoalData) => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.CREATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
        });
        if (!response.ok) {
            throw new Error("createGoal call failed");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to create goal:", error);
        throw error;
    }
};

export const createGoalFromTemplate = async (templateId: number, goalData: Omit<CreateGoalData, 'category_id' | 'timeframe' | 'target'>) => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.CREATE_FROM_TEMPLATE(templateId), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
        });
        if (!response.ok) {
            throw new Error("createGoalFromTemplate call failed");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to create goal from template:", error);
        throw error;
    }
};

export interface WasteLog {
    id: number;
    sub_category_name: string;
    quantity: string;
    unit?: string;
    date_logged: string;
    disposal_date: string;
    disposal_location: string | null;
    disposal_photo?: string;
    score: number;
    sub_category: number;
}


export const getWasteLogs = async (): Promise<WasteLog[]> => {
    try {
        const wasteLogs = await fetchAllPages<WasteLog>(API_ENDPOINTS.WASTE.LOGS);
        return wasteLogs;
    } catch (error) {
        console.error("Failed to get waste logs:", error);
        throw error;
    }
};

export const getWasteLogById = async (logId: number): Promise<WasteLog> => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOG_BY_ID(logId));
        if (!response.ok) {
            throw new Error("getWasteLogById call failed");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to get waste log by ID:", error);
        throw error;
    }
};

export interface CreateWasteLogData {
    sub_category: number;
    quantity: number;
    disposal_date: string;
    disposal_location?: string;
}

export const createWasteLog = async (wasteLogData: CreateWasteLogData) => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOGS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wasteLogData),
        });
        if (!response.ok) {
            throw new Error("createWasteLog call failed");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to create waste log:", error);
        throw error;
    }
};

export interface UpdateWasteLogData {
    quantity?: number;
    disposal_location?: string;
    disposal_date?: string;
}

export const updateWasteLog = async (logId: number, updateData: UpdateWasteLogData) => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOG_BY_ID(logId), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });
        if (!response.ok) {
            throw new Error("updateWasteLog call failed");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to update waste log:", error);
        throw error;
    }
};

export const deleteWasteLog = async (logId: number) => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOG_BY_ID(logId), {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error("deleteWasteLog call failed");
        }
        return response.ok;
    } catch (error) {
        console.error("Failed to delete waste log:", error);
        throw error;
    }
};

export interface CreateCategoryRequestData {
    name: string;
    description?: string;
    unit: string;
}

export const createCategoryRequest = async (requestData: CreateCategoryRequestData) => {
    try {
        const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.CATEGORY_REQUEST, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        });
        if (!response.ok) {
            throw new Error("createCategoryRequest call failed");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to create category request:", error);
        throw error;
    }
};