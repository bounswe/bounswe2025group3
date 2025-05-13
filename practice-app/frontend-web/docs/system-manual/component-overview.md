
**File: `docs/system-manual/component-overview.md`**
```markdown
# Component Overview

## Core Components
- **App.js**: Root component, sets up routing with `react-router-dom`.
- **Navbar.js**: Navigation bar, conditional based on authentication status.

## Page Components
- **Home.js**: Public landing page with hero, mission, tips, and rewards.
- **AboutUsPage.js**: Displays team and mission information.
- **BlogPage.js** and **BlogPostPage.js**: Lists and displays blog content.
- **LoginPage.js**, **SignupPage.js**, **ForgotPasswordPage.js**, **ResetPasswordPage.js**: Handle authentication flows.
- **Dashboard.js**: User hub with eco-score, quick links, and tips.
- **WasteLog.js**: Form and list for logging waste.
- **LeaderboardPage.js**: Displays ranked users by eco-score.
- **ChallengesPage.js** and **ChallengeCard.js**: Lists and displays eco-challenges.
- **Profile.js**: User profile management.

## Component Structure
- **Reusable Components**: `Navbar`, `ChallengeCard`, `Icon` (custom).
- **Feature-Specific**: Organized under `src/components/<feature>/`, e.g., `auth/`, `challenges/`.
- **Props and State**:
  - Most components use `useState` and `useEffect` for local state and API calls.
  - Redux Toolkit manages global state (e.g., user data).

## Styling
- Each component has a corresponding `.css` file (e.g., `Home.css`).
- CSS Modules ensure scoped styles.
- Global styles in `index.css` and `App.css`.

## API Integration
- Components like `WasteLog`, `Dashboard`, and `Profile` use `api.js` services for data fetching and updates.