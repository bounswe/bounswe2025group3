# Role-Based Access Control System

This document explains the role-based access control (RBAC) system implemented in the mobile app.

## Overview

The RBAC system consists of several key components:

1. **Tab Visibility Control**: Conditionally renders tabs based on user roles
2. **Route Protection Hook**: Prevents unauthorized access to screens
3. **Role-Protected API Requests**: Ensures backend requests respect role permissions

## User Roles

The system supports three roles, in order of increasing privileges:

1. `USER` - Regular users with basic app access
2. `MODERATOR` - Moderators who can manage users and approve/reject requests
3. `ADMIN` - Administrators with full access to all features

## Implementation Details

### 1. Tab Layout (`_layout.tsx`)

The tab layout uses a role-based approach to render only the tabs that the user should have access to:

```typescript
// Render tabs based on user role
if (isAdmin) {
  // Show both moderator and admin tabs
} 
else if (isModerator) {
  // Show only moderator tab
}
else {
  // Regular users only see common tabs
}
```

### 2. Role Protection Hook (`useRoleProtection.ts`)

The `useRoleProtection` hook provides a reusable way to protect routes:

```typescript
// Usage example - protect admin routes
const { isAuthorized, user } = useRoleProtection(['ADMIN']);

// Or allow multiple roles
const { isAuthorized, user } = useRoleProtection(['MODERATOR', 'ADMIN']);
```

The hook handles:
- Checking user roles
- Redirecting unauthorized users
- Showing access denied alerts
- Returning authorization status for conditional rendering

### 3. Role-Protected API Requests

The `roleProtectedFetch` method extends the TokenManager to make authenticated requests that respect role permissions:

```typescript
// Example usage
const response = await TokenManager.roleProtectedFetch(
  API_ENDPOINTS.WASTE.ADMIN.CATEGORY_REQUESTS,
  ['ADMIN'],  // Roles that can access this endpoint
  {
    method: 'POST',
    body: JSON.stringify(data),
  }
);
```

## Best Practices

1. Always use `useRoleProtection` hook in route components
2. Use `roleProtectedFetch` instead of `authenticatedFetch` for API calls
3. When developing new features, clearly define which roles should have access
4. Do not rely solely on hiding UI elements - always enforce permissions on the backend

## Troubleshooting

If you encounter issues with the role-based access control:

1. Check the user role in the UserContext
2. Ensure the tab layout logic properly includes/excludes tabs
3. Verify that route protection is applied to the specific screen
4. Confirm the backend endpoints correctly enforce the same permissions 