import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import BlogPage from '../components/blog/BlogPage';

// Mock Header
jest.mock('../components/common/Header', () => () => <div data-testid="mock-header">Header</div>);

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (key === 'blog.posts' && options?.returnObjects) {
        // Return mock translated data for the 3 static posts
        return [
          { title: 'Post 1 Title', date: '2025-01-01', excerpt: 'Excerpt 1' },
          { title: 'Post 2 Title', date: '2025-01-02', excerpt: 'Excerpt 2' },
          { title: 'Post 3 Title', date: '2025-01-03', excerpt: 'Excerpt 3' },
        ];
      }
      return key;
    },
  }),
}));

const renderWithRouter = (ui) => render(ui, { wrapper: BrowserRouter });

describe('BlogPage Component', () => {
  test('renders page header', () => {
    renderWithRouter(<BlogPage />);
    expect(screen.getByText('blog.header.title')).toBeInTheDocument();
    expect(screen.getByText('blog.header.subtitle')).toBeInTheDocument();
  });

  test('renders blog post list correctly', () => {
    renderWithRouter(<BlogPage />);
    
    // Check for titles from the mock
    expect(screen.getByText('Post 1 Title')).toBeInTheDocument();
    expect(screen.getByText('Post 2 Title')).toBeInTheDocument();
    expect(screen.getByText('Post 3 Title')).toBeInTheDocument();

    // Check for excerpts
    expect(screen.getByText('Excerpt 1')).toBeInTheDocument();

    // Check for read more links
    const readMoreLinks = screen.getAllByText('blog.read_more_button');
    expect(readMoreLinks).toHaveLength(3);
  });
});