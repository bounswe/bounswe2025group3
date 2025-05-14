# Profile Guide

## Purpose
The Profile page allows users to view and edit their personal information, customize preferences, and manage their account settings.

## Accessing the Profile
- **From Dashboard**: Click "Profile" in the Navbar or a quick link.
- **Direct URL**: Navigate to `/profile`.
- **Availability**: Requires login; redirects to `/login` if unauthenticated.

## Using the Profile
1. **View Profile**:
   - See your details: Username, Email, First Name, Last Name, Bio, City, Country.
   - View your eco-score and account creation date (if displayed).
2. **Edit Profile**:
   - Click "Edit" or a pencil icon to enter edit mode.
   - Update fields like Bio, City, or Country.
   - Click "Save" to submit changes (sends PATCH to `/api/user/me/`).
3. **Change Password (Optional)**:
   - If available, use a "Change Password" link to update your password.
   - Requires current password and new password confirmation.
4. **Manage Preferences**:
   - Toggle settings like email notifications or theme (if implemented).
5. **Logout**:
   - Click "Logout" (in Navbar or profile card) to sign out.

## Features
- **Dynamic Data**: Fetched via API (e.g., `/api/user/me/`).
- **Form Validation**: Ensures valid inputs (e.g., email format, required fields).
- **Responsive Design**: Optimized for all devices.

## Tips
- Keep your profile updated with a bio and location to engage with the community.
- Save changes frequently to avoid losing edits.
- Use a strong password if updating it.

## Troubleshooting
- **Changes Not Saving?** Check for validation errors or network issues.
- **Profile Not Loading?** Ensure you’re logged in and the API is running.
- **Need Help?** Contact support via the About Us page.