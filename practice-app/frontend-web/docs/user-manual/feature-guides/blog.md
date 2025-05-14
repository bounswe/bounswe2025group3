# Blog Guide

## Purpose
The Blog feature provides sustainability articles, tips, and updates to educate and engage users, fostering a community around eco-friendly practices.

## Accessing the Blog
- **From Homepage**: Click "Blog" in the Navbar.
- **Direct URL**: Navigate to `/blog`.
- **Availability**: Accessible to all users, no login required.

## Using the Blog
1. **Browse Posts**:
   - View a list of blog posts with titles, summaries, and publication dates.
   - Scroll or use pagination (if implemented) to see more posts.
2. **Read a Post**:
   - Click a post title or "Read More" to view the full article (navigates to `/blog/:id`).
   - Read content, including text, images, and embedded media (if any).
3. **Navigate Back**:
   - Use the Navbar’s "Blog" link or browser’s back button to return to the post list.
4. **Search or Filter (Optional)**:
   - If available, use a search bar or category filters to find specific topics (e.g., "Recycling Tips").

## Features
- **Post List**: Displays recent posts in a grid or list format.
- **Dynamic Routing**: Individual posts accessed via `/blog/:id`.
- **Responsive Design**: Readable on all devices.
- **API-Driven**: Posts fetched from the backend API (assumed endpoint: `/api/blog/posts/`).

## Tips
- Check the blog regularly for new sustainability tips.
- Bookmark favorite posts using your browser for quick access.
- Share posts via social media buttons (if implemented).

## Troubleshooting
- **Posts Not Loading?** Verify your internet connection or check if the backend API is down.
- **Broken Links?** Ensure the post ID in the URL is valid.
- **Need Help?** Contact support via the About Us page (`/about`).