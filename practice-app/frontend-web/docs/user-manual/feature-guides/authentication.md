# Authentication Guide

## Signing Up
- **Access**: Click "Sign Up" from the homepage or navigate to `/signup`.
- **Fields**:
  - **Required**: Username, Email, Password, Confirm Password.
  - **Optional**: First Name, Last Name, Bio, City, Country.
- **Action**: Submit the form to create an account. Redirects to `/login`.

## Logging In
- **Access**: Click "Login" or go to `/login`.
- **Options**:
  - **Email/Password**: Enter credentials and click "Login".
  - **Google SSO**: Click the Google button to sign in via Google.
- **Remember Me**: Check to persist your session (optional).
- **Redirect**: Successful login takes you to `/dashboard`.

## Password Recovery
- **Forgot Password**:
  - Click "Forgot Password?" on the login page (`/forgot-password`).
  - Enter your email and submit.
  - Check your inbox (and spam) for a reset link.
- **Reset Password**:
  - Click the reset link (`/reset-password/:uid/:token`).
  - Enter and confirm your new password.
  - Redirects to `/login` upon success.

## Logging Out
- Click "Logout" in the Navbar or profile card on the dashboard.
- Clears session and redirects to `/login`.