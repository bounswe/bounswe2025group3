import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";
import { fetchAllPages } from "./utils";

export type Subcategory = {
    id: number;
    name: string;
    category: number;
    description: string;
    score_per_unit: string;
    unit: string;
    is_active: boolean;
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

export interface CreateWasteLogData {
    sub_category: number;
    quantity: number;
    disposal_date: string;
    disposal_location?: string;
}

export interface UpdateWasteLogData {
    quantity?: number;
    disposal_location?: string;
    disposal_date?: string;
}

export interface CreateCategoryRequestData {
    name: string;
    description?: string;
    unit: string;
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

export const getMyScore = async (): Promise<number> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.MY_SCORE);
    const data = await parseJson<{ total_score: number }>(response, "Failed to load score.");
    return data.total_score;
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
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOG_BY_ID(logId));
    return parseJson<WasteLog>(response, "Failed to load waste log.");
};

export const createWasteLog = async (wasteLogData: CreateWasteLogData): Promise<WasteLog> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wasteLogData),
    });
    return parseJson<WasteLog>(response, "Failed to create waste log.");
};

export const updateWasteLog = async (logId: number, updateData: UpdateWasteLogData): Promise<WasteLog> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOG_BY_ID(logId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
    return parseJson<WasteLog>(response, "Failed to update waste log.");
};

export const deleteWasteLog = async (logId: number): Promise<void> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOG_BY_ID(logId), {
        method: 'DELETE',
    });
    await parseJson<null>(response, "Failed to delete waste log.");
};

export const createCategoryRequest = async (requestData: CreateCategoryRequestData) => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.CATEGORY_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    });
    return parseJson(response, "Failed to create category request.");
};

