# Challenges Guide

## Purpose
The Challenges feature allows users to participate in eco-friendly challenges (e.g., "Reduce Plastic Use") to earn points, boost their eco-score, and engage with the community.

## Accessing Challenges
- **From Dashboard**: Click "Challenges" in the Navbar or a quick link on the dashboard.
- **Direct URL**: Navigate to `/challenges`.
- **Availability**: Requires login; redirects to `/login` if unauthenticated.

## Using Challenges
1. **Browse Challenges**:
   - View a list of available challenges, each displayed as a `ChallengeCard`.
   - Details include challenge name, description, duration, and points.
2. **Join a Challenge**:
   - Click "Join" on a challenge card.
   - Confirm participation (may involve a modal or API call).
   - Joined challenges may appear in a "My Challenges" section.
3. **Track Progress**:
   - Check your progress on active challenges (e.g., tasks completed, points earned).
   - Progress may update automatically (e.g., after logging waste) or require manual input.
4. **Complete Challenges**:
   - Finish tasks to complete the challenge.
   - Earn points added to your eco-score, visible on the dashboard.

## Features
- **Challenge Cards**: Interactive components showing challenge details.
- **API Integration**: Fetches challenges from the backend (assumed endpoint: `/api/challenges/`).
- **Progress Tracking**: Updates via API calls (e.g., `/api/challenges/:id/progress`).
- **Responsive Design**: Optimized for all devices.

## Tips
- Join challenges that align with your lifestyle for easier completion.
- Check the dashboard for updates on your challenge progress.
- Participate regularly to improve your eco-score and leaderboard ranking.

## Troubleshooting
- **Can’t Join?** Ensure you’re logged in and the challenge is still active.
- **Progress Not Updating?** Verify your actions (e.g., waste logs) are recorded.
- **Need Help?** Contact support via the About Us page.