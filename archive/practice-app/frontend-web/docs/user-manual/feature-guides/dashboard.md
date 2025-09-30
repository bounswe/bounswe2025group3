# Dashboard Guide

## Purpose
The Dashboard is the central hub for authenticated users, providing an overview of their eco-score, quick links to features, and personalized eco-tips.

## Accessing the Dashboard
- **After Login**: Automatically redirected to `/dashboard` after signing in.
- **From Navbar**: Click "Dashboard" in the top navigation.
- **Direct URL**: Navigate to `/dashboard`.
- **Availability**: Requires login; redirects to `/login` if unauthenticated.

## Using the Dashboard
1. **View Eco-Score**:
   - See your current eco-score (points earned from waste logging, challenges, etc.).
   - Displayed prominently, often with a visual indicator (e.g., gauge or number).
2. **Access Quick Links**:
   - Click links or buttons to navigate to features like Waste Log, Challenges, or Profile.
   - Example: "Log Waste" button takes you to `/waste`.
3. **Read Eco-Tips**:
   - Browse personalized or general sustainability tips (e.g., "Compost food scraps").
   - Tips may rotate or be fetched from the backend.
4. **Check Recent Activity**:
   - View recent waste logs or challenge updates (if implemented).
   - Example: "Logged 2kg of plastic on May 12".

## Features
- **Eco-Score Display**: Fetched via API (e.g., `/api/waste/scores/me/`).
- **Quick Links**: Shortcuts to key features for easy navigation.
- **Dynamic Content**: Tips and activity updated via API or Redux state.
- **Responsive Design**: Optimized for desktop and mobile.

## Tips
- Visit the dashboard daily to track your eco-score and discover new tips.
- Use quick links to save time navigating to frequent features.
- Monitor your recent activity to stay motivated.

## Troubleshooting
- **Eco-Score Not Updating?** Ensure waste logs or challenges are submitted correctly.
- **Tips Not Loading?** Check your internet connection or API status.
- **Need Help?** Contact support via the About Us page.