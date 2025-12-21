import tokenManager from "@/services/tokenManager";
import { API_ENDPOINTS } from "@/constants/api";
import { fetchAllPages, parseJson } from "./utils";
import i18n from "@/i18n";

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
    disposal_photo?: string;      // Legacy field
    disposal_photo_url?: string;  // New field from backend
    score: number;
    sub_category: number;
}

export interface CreateWasteLogData {
    sub_category: number;
    quantity: number;
    disposal_date: string;
    disposal_location?: string;
    disposal_photo?: string; // URI of the photo
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

export type WasteStatPeriod = {
    start_date: string;
    end_date: string;
    total_score: number;
    total_log: number;
};

export const getMyScore = async (): Promise<number> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.MY_SCORE);
    const data = await parseJson<{ total_score: number }>(response, "Failed to load score.");
    return data.total_score;
};

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

export const getSubcategories = async (): Promise<Subcategory[]> => {
    try {
        const subcategories = await fetchAllPages<Subcategory>(API_ENDPOINTS.WASTE.SUBCATEGORIES);
        // Translate category names and units
        return subcategories.map(sub => ({
            ...sub,
            name: translateCategoryName(sub.name),
            unit: translateUnit(sub.unit),
        }));
    } catch (error) {
        console.error("Failed to get subcategories:", error);
        throw error;
    }
};

export const getWasteLogs = async (): Promise<WasteLog[]> => {
    try {
        const wasteLogs = await fetchAllPages<WasteLog>(API_ENDPOINTS.WASTE.LOGS);
        // Translate category names and units
        return wasteLogs.map(log => ({
            ...log,
            sub_category_name: translateCategoryName(log.sub_category_name),
            unit: log.unit ? translateUnit(log.unit) : log.unit,
        }));
    } catch (error) {
        console.error("Failed to get waste logs:", error);
        throw error;
    }
};

export const getWasteLogById = async (logId: number): Promise<WasteLog> => {
    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOG_BY_ID(logId));
    const log = await parseJson<WasteLog>(response, "Failed to load waste log.");
    // Translate category name and unit
    return {
        ...log,
        sub_category_name: translateCategoryName(log.sub_category_name),
        unit: log.unit ? translateUnit(log.unit) : log.unit,
    };
};

export const createWasteLog = async (wasteLogData: CreateWasteLogData): Promise<WasteLog> => {
    const formData = new FormData();
    formData.append('sub_category', String(wasteLogData.sub_category));
    formData.append('quantity', String(wasteLogData.quantity));
    formData.append('disposal_date', wasteLogData.disposal_date);

    if (wasteLogData.disposal_location) {
        formData.append('disposal_location', wasteLogData.disposal_location);
    }

    if (wasteLogData.disposal_photo) {
        const uri = wasteLogData.disposal_photo;
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // Backend expects 'disposal_photo_file' for file uploads
        formData.append('disposal_photo_file', {
            uri,
            name: filename,
            type,
        } as any);
    }

    const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.LOGS, {
        method: 'POST',
        headers: {
            // Content-Type is handled automatically by FormData, but we need to ensure tokenManager doesn't override it with application/json if we don't pass it.
            // However, usually fetch handles FormData correctly if Content-Type is NOT set.
            // Let's assume tokenManager handles this or we might need to check its implementation.
            // Standard fetch with FormData should NOT have Content-Type header set manually.
        },
        body: formData,
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

export const getWasteStats = async (
    period: 'daily' | 'weekly' = 'weekly',
    subcategoryId?: number
): Promise<WasteStatPeriod[]> => {
    const params = new URLSearchParams();
    params.append('period', period);
    if (subcategoryId) {
        params.append('subcategory', String(subcategoryId));
    }

    const endpoint = `${API_ENDPOINTS.WASTE.USER_STATS}?${params.toString()}`;
    const response = await tokenManager.authenticatedFetch(endpoint);
    const data = await parseJson<{ data?: WasteStatPeriod[] }>(response, "Failed to load waste stats.");
    return data?.data ?? [];
};

