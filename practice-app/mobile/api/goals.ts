import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";
import { fetchAllPages, parseJson } from "./utils";
import { Subcategory } from "./waste";

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

export interface GoalTemplate {
    id: number;
    name: string;
    description: string;
    category_name: string;
    target: number;
    timeframe: string;
}

export interface CreateGoalData {
    user: number;
    category_id: number;
    timeframe: 'daily' | 'weekly' | 'monthly';
    target: number;
    start_date: string;
    status?: string;
}

export interface UpdateGoalData {
    user: number;
    category_id: number;
    timeframe: 'daily' | 'weekly' | 'monthly';
    target: number;
    start_date: string;
}

export const getGoals = async (): Promise<Goal[]> => {
    try {
        const goals = await fetchAllPages<Goal>(API_ENDPOINTS.GOALS.LIST);
        return goals;
    } catch (error) {
        console.error("Failed to get goals", error);
        throw error;
    }
};

export const getGoalById = async (id: number): Promise<Goal> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.BY_ID(id.toString()));
    return parseJson<Goal>(response, "Failed to load goal details.");
};

export const getGoalTemplates = async (): Promise<GoalTemplate[]> => {
    try {
        const goalTemplates = await fetchAllPages<GoalTemplate>(API_ENDPOINTS.GOALS.TEMPLATES);
        return goalTemplates;
    } catch (error) {
        console.error("Failed to get goal templates:", error);
        throw error;
    }
};

export const createGoal = async (goalData: CreateGoalData): Promise<Goal> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
    });
    return parseJson<Goal>(response, "Failed to create goal.");
};

export const createGoalFromTemplate = async (
    templateId: number,
    goalData: Omit<CreateGoalData, 'category_id' | 'timeframe' | 'target'>
): Promise<Goal> => {
    const response = await tokenManager.authenticatedFetch(
        API_ENDPOINTS.GOALS.CREATE_FROM_TEMPLATE(templateId),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
        }
    );
    return parseJson<Goal>(response, "Failed to create goal from template.");
};

export const updateGoal = async (id: number, goalData: UpdateGoalData): Promise<Goal> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.BY_ID(id.toString()), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
    });
    return parseJson<Goal>(response, "Failed to update goal.");
};

export const deleteGoal = async (id: number): Promise<void> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.BY_ID(id.toString()), {
        method: 'DELETE',
    });
    await parseJson<null>(response, "Failed to delete goal.");
};

