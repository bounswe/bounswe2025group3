# Badge Popup Fix - Mobile-Only Solution

## Problem
When users log waste, they earn badges but no popup appears to notify them.

## Root Cause
1. **Badge Detection**: The `BadgeContext` was looking for `earned_at` or `achieved_at` timestamps to detect newly earned badges, but the backend API (`/api/v1/rewards/badges/me/`) only returns `earned: true/false` without timestamps.
2. **Field Name Mismatch**: The mobile app was checking for `is_earned` field, but the backend API returns `earned` (without underscore). This caused all badges to appear as "In progress" with dimmed colors even when they were earned.

## Solution (Mobile-Only, No Backend Changes)

### Changed File: `hooks/badgeContext.tsx`

**What Changed:**
- **OLD**: Detected new badges by checking if they have `earned_at` timestamp AND not shown before
- **NEW**: Detects new badges by checking if they have `earned: true` flag AND not shown before

**How It Works:**
1. **First Check** (Initialization):
   - Fetches all badges from backend
   - Marks all currently earned badges as "already shown"
   - Stores this in AsyncStorage (per user)
   - Doesn't show any popups

2. **Immediate Checks** (After Key Actions):
   - **After logging waste** → Checks for new badges (1 second delay)
   - **After joining event** → Checks for new badges (1 second delay)
   - **After creating event** → Checks for new badges (1 second delay)
   - Compares with "already shown" list
   - If a badge is NOW earned BUT NOT in the "shown" list → **NEW BADGE!**
   - Shows popup for the new badge
   - Adds it to the "shown" list

3. **Background Polling** (Every 30 seconds):
   - Fallback check in case immediate checks miss something
   - Also catches badges earned through other means

4. **User Experience:**
   - User logs waste item / joins event / creates event
   - Within 1-2 seconds, badge popup appears (if badge earned)
   - Popup auto-closes after 3.5 seconds
   - Can manually close by tapping

## Code Changes Summary

### 1. BadgeContext - Check 'earned' flag instead of timestamps
```typescript
// OLD (hooks/badgeContext.tsx)
const earnedAt = badge.earned_at || badge.achieved_at;
if (earnedAt) {
  existingBadgeIds.push(badgeId);
}

// NEW
const isEarned = badge.is_earned || badge.earned || (badge.badge && badge.badge.earned);
if (isEarned) {
  existingBadgeIds.push(badgeId);
}
```

### 2. Badge Interface - Added 'earned' field
```typescript
// api/badges.ts
export interface Badge {
  badge: BadgeInfo;
  is_earned?: boolean;
  earned?: boolean;  // ← ADDED: Backend sends 'earned', not 'is_earned'
  // ... other fields
}
```

### 3. Badge Display - Check both 'earned' and 'is_earned' fields
```typescript
// app/badges.tsx - OLD
const isEarned =
  typeof item.is_earned === "boolean"
    ? item.is_earned
    : !!achievedAt || ...;

// NEW - Checks 'earned' first (from backend), then 'is_earned' as fallback
const isEarned =
  typeof item.earned === "boolean"
    ? item.earned
    : typeof item.is_earned === "boolean"
    ? item.is_earned
    : !!achievedAt || ...;
```

## Testing Instructions

### Test 1: First Badge
1. **Create a new test account** OR **Clear badge cache** (see below)
2. **Log one waste item** (any category, any quantity)
3. **Wait 5-10 seconds**
4. **Expected**: Popup appears saying you earned "First Step" badge 🎖

### Test 2: Subsequent Badge
1. **Log 9 more plastic items** (to reach 10 plastic items total)
2. **Wait 5-10 seconds**
3. **Expected**: Popup appears saying you earned "Plastic Buster" badge 🥤

### How to Clear Badge Cache (For Testing)
Add this temporary code to any screen (e.g., `app/(tabs)/home/index.tsx`):

```typescript
import { useBadge } from '@/hooks/badgeContext';

// Inside component:
const { clearShownBadges } = useBadge();

// Add a button:
<TouchableOpacity onPress={clearShownBadges}>
  <Text>Reset Badge System</Text>
</TouchableOpacity>
```

OR use React Native Debugger console:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.multiRemove([
  '@shown_badge_ids', 
  '@badge_system_initialized'
]);
```

## Limitations

1. **No Timestamp in Popup**: The badge popup won't show "Earned on [date]" because the API doesn't provide timestamps
2. **1-2 Second Delay**: Popups appear within 1-2 seconds after actions (intentional delay to allow backend processing)
3. **One at a Time**: If multiple badges are earned simultaneously, they appear one by one with 500ms delay between popups
4. **Action-Triggered Only**: Badges are only checked after specific actions (waste logging, event participation, event creation). If badges are earned through other means, they'll be detected by the 30-second background poll.

## Why This Works Without Backend Changes

- The backend already calculates which badges are earned (line 38 of `backend/apps/rewards/api/v1/views.py`)
- The backend returns `earned: true` for earned badges
- We just needed to **check the `earned` flag instead of timestamps**
- All badge detection logic runs client-side in `BadgeContext`
- Uses AsyncStorage to remember which badges have been shown

## Files Modified

- ✅ `mobile/api/badges.ts` - Added `earned` field to Badge interface
- ✅ `mobile/app/badges.tsx` - Fixed field name check (now checks `earned` before `is_earned`)
- ✅ `mobile/hooks/badgeContext.tsx` - Badge detection logic & polling interval (30s)
- ✅ `mobile/app/(tabs)/waste/add.tsx` - Triggers badge check after waste logging (ALREADY EXISTED)
- ✅ `mobile/app/events/[id].tsx` - Triggers badge check after event participation (ALREADY EXISTED)
- ✅ `mobile/app/events/add.tsx` - Triggers badge check after event creation (NEWLY ADDED)
- ✅ `mobile/BADGE_FIX_MOBILE_ONLY.md` - This documentation

## Files NOT Modified (No Backend Changes)

- ❌ `backend/apps/rewards/signals.py` - Not needed
- ❌ `backend/apps/notifications/models.py` - Not needed
- ❌ Database migrations - Not needed

