
#### File: `docs/system-manual/routing.md`
```markdown
# Routing

## Overview
The Greener frontend uses `react-router-dom` (v7.5.3) for client-side routing, enabling seamless navigation without full page reloads. Routing is configured in `src/App.js`, mapping URLs to components.

## Setup
- **Dependency**: `react-router-dom` is installed via `package.json`.
- **Root Configuration**: In `src/App.js`, the app is wrapped with `<BrowserRouter>` to enable routing.
- **Routes**: Defined using `<Routes>` and `<Route>` components.

## Route Structure
Routes are organized into public and authenticated sections, with some routes protected based on authentication status.

### Public Routes
- `/`: `Home` (landing page with hero, mission, tips).
- `/about`: `AboutUsPage` (team and mission details).
- `/blog`: `BlogPage` (list of blog posts).
- `/blog/:id`: `BlogPostPage` (individual blog post).
- `/login`: `LoginPage` (authentication form).
- `/signup`: `SignupPage` (registration form).
- `/forgot-password`: `ForgotPasswordPage` (password reset request).
- `/reset-password/:uid/:token`: `ResetPasswordPage` (password reset confirmation).

### Authenticated Routes
- `/dashboard`: `Dashboard` (user hub with eco-score and links).
- `/waste`: `WasteLog` (waste tracking form and logs).
- `/leaderboard`: `LeaderboardPage` (ranked users by eco-score).
- `/challenges`: `ChallengesPage` (eco-challenges list).
- `/profile`: `Profile` (user profile management).

## Protected Routes
- Authenticated routes are wrapped in a custom `ProtectedRoute` component.
- **Logic**:
  - Checks `localStorage.getItem('access_token')` or Redux `auth.isAuthenticated`.
  - Redirects to `/login` if unauthenticated.
- **Implementation** (in `src/components/common/ProtectedRoute.js`):
```javascript
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
```
## Usage in App.js:
```javascript
<Route
  path="/dashboard"
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
/>
```
## App.js Routing Setup:

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './components/home/Home';
import LoginPage from './components/auth/LoginPage';
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

        {/* Authenticated Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/waste"
          element={<ProtectedRoute><WasteLog /></ProtectedRoute>}
        />
        <Route
          path="/leaderboard"
          element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>}
        />
        <Route
          path="/challenges"
          element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```
## Navigation
- Navbar: Renders links based on isAuthenticated (see src/components/common/Navbar.js).
    - Public: Links to /, /about, /blog, /login, /signup.
    - Authenticated: Links to /dashboard, /waste, /leaderboard, /challenges, /profile, /logout.
- Programmatic Navigation:
    - Uses useNavigate hook, e.g., in LoginPage to redirect to /dashboard after login.
    - Example:
```javascript
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const handleSubmit = async () => {
    // ... login logic
    navigate('/dashboard');
  };
};
```
## Dynamic Routes
- Blog Posts: /blog/:id uses useParams to fetch the post ID.
    - Example in BlogPostPage.js:
```javascript
import { useParams } from 'react-router-dom';

const BlogPostPage = () => {
  const { id } = useParams();
  // Fetch post with id
};
```
- Password Reset: /reset-password/:uid/:token extracts uid and token for reset logic.

## Best Practices
- Route Protection: Always wrap authenticated routes with ProtectedRoute.
- 404 Handling: Consider adding a <Route path="*" element={<NotFound />} /> for invalid URLs.
- Lazy Loading: For larger apps, use React.lazy to load components on demand.
- Testing: Test routes with react-router-dom mocks (see docs/testing/).

## Why React Router?
- Client-Side Routing: Fast navigation without server requests.
- Declarative API: Simplifies route definitions.
- Alternative Considered: Next.js (server-side rendering, but overkill for this project).


