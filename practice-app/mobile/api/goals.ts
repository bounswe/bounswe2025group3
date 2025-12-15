import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";
import { fetchAllPages, parseJson } from "./utils";
import { Subcategory } from "./waste";
import i18n from "@/i18n";

// Helper function to translate category names
const translateCategoryName = (apiName: string | undefined): string => {
    if (!apiName) return "";
    const key = apiName.toLowerCase().replace(/ /g, "_");
    return i18n.t(`waste_categories.${key}`, { defaultValue: apiName });
};

// Helper function to translate units
const translateUnit = (unit: string | undefined): string => {
    if (!unit) return "";
    return i18n.t(`units.${unit.toLowerCase()}`, { defaultValue: unit });
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
        // Translate category names and units
        return goals.map(goal => ({
            ...goal,
            category: {
                ...goal.category,
                name: translateCategoryName(goal.category.name),
                unit: translateUnit(goal.category.unit),
            },
        }));
    } catch (error) {
        console.error("Failed to get goals", error);
        throw error;
    }
};

export const getGoalById = async (id: number): Promise<Goal> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.GOALS.BY_ID(id.toString()));
    const goal = await parseJson<Goal>(response, "Failed to load goal details.");
    // Translate category name and unit
    return {
        ...goal,
        category: {
            ...goal.category,
            name: translateCategoryName(goal.category.name),
            unit: translateUnit(goal.category.unit),
        },
    };
};

export const getGoalTemplates = async (): Promise<GoalTemplate[]> => {
    try {
        const goalTemplates = await fetchAllPages<GoalTemplate>(API_ENDPOINTS.GOALS.TEMPLATES);
        // Translate category names
        return goalTemplates.map(template => ({
            ...template,
            category_name: translateCategoryName(template.category_name),
        }));
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

