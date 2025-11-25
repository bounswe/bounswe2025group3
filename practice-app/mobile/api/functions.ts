/**
 * @deprecated This file is kept for backward compatibility.
 * Please import directly from the specific modules:
 * - User functions: import from '@/api/user'
 * - Waste functions: import from '@/api/waste'
 * - Goals functions: import from '@/api/goals'
 * - Challenges functions: import from '@/api/challenges'
 * - Utils: import from '@/api/utils'
 */

// Re-export user functions
export { getUserProfile, updateUserProfile, UpdateProfileData, UserProfile } from './user';

// Re-export waste functions
export {
    getMyScore,
    getSubcategories,
    getWasteLogs,
    getWasteLogById,
    createWasteLog,
    updateWasteLog,
    deleteWasteLog,
    createCategoryRequest,
    Subcategory,
    WasteLog,
    CreateWasteLogData,
    UpdateWasteLogData,
    CreateCategoryRequestData,
} from './waste';

// Re-export utils
export { fetchAllPages } from './utils';
