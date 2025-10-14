# Waste Logging Guide

## Purpose
The Waste Logging feature allows users to track their waste reduction efforts, categorize waste types, and contribute to their eco-score.

## Accessing Waste Logging
- **From Dashboard**: Click "Waste Log" in the Navbar or a quick link.
- **Direct URL**: Navigate to `/waste`.
- **Availability**: Requires login; redirects to `/login` if unauthenticated.

## Using Waste Logging
1. **View Recent Logs**:
   - See a list of your recent waste logs (e.g., "2kg Plastic, May 12").
   - Includes category, quantity, and date.
2. **Log New Waste**:
   - Fill out the form:
     - **Category**: Select from a dropdown (e.g., Plastic, Organic), fetched from `/api/waste/subcategories/`.
     - **Quantity**: Enter the amount (e.g., 1.5 kg).
     - **Date** (Optional): Defaults to today.
   - Click "Submit" to save the log (sends POST to `/api/waste/logs/`).
3. **Edit or Delete Logs (Optional)**:
   - If available, click an edit/delete icon next to a log to modify or remove it.
   - Confirm changes via a modal or form.
4. **Check Eco-Score Impact**:
   - New logs increase your eco-score, visible on the dashboard.

## Features
- **Dynamic Form**: Categories loaded from the backend API.
- **Log History**: Displays past entries with pagination (if implemented).
- **API Integration**: Submits and retrieves data via `/api/waste/logs/`.
- **Responsive Design**: Usable on all devices.

## Tips
- Log waste daily to accurately track your habits.
- Use specific categories for better insights (e.g., "Glass" vs. "Other").
- Check your eco-score on the dashboard after logging.

## Troubleshooting
- **Form Not Submitting?** Verify all required fields are filled and valid.
- **Categories Not Loading?** Check your internet or API status.
- **Need Help?** Contact support via the About Us page.