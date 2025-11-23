import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InfoBox from '../components/home/InfoBox';
import * as wikidataService from '../services/wikidata';

// Mock the wikidata service
jest.mock('../services/wikidata');

describe('InfoBox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Return never-resolving promises to simulate loading
    wikidataService.fetchWikidataDescriptionRecycling.mockReturnValue(new Promise(() => {}));
    wikidataService.fetchWikidataDescriptionSustainableDevelopment.mockReturnValue(new Promise(() => {}));
    wikidataService.fetchWikidataDescriptionCircularEconomy.mockReturnValue(new Promise(() => {}));

    render(<InfoBox />);

    // Check for initial loading text
    expect(screen.getByText('Loading recycling...')).toBeInTheDocument();
    expect(screen.getByText('Loading sustainable development...')).toBeInTheDocument();
    expect(screen.getByText('Loading circular economy...')).toBeInTheDocument();
  });

  test('renders fetched descriptions successfully', async () => {
    // Mock successful resolutions
    wikidataService.fetchWikidataDescriptionRecycling.mockResolvedValue('Recycling description');
    wikidataService.fetchWikidataDescriptionSustainableDevelopment.mockResolvedValue('SusDev description');
    wikidataService.fetchWikidataDescriptionCircularEconomy.mockResolvedValue('Circular description');

    render(<InfoBox />);

    await waitFor(() => {
      expect(screen.getByText('Recycling description')).toBeInTheDocument();
      expect(screen.getByText('SusDev description')).toBeInTheDocument();
      expect(screen.getByText('Circular description')).toBeInTheDocument();
    });
  });

  test('renders error messages on fetch failure', async () => {
    // Mock rejections
    wikidataService.fetchWikidataDescriptionRecycling.mockRejectedValue(new Error('Error'));
    wikidataService.fetchWikidataDescriptionSustainableDevelopment.mockRejectedValue(new Error('Error'));
    wikidataService.fetchWikidataDescriptionCircularEconomy.mockRejectedValue(new Error('Error'));

    render(<InfoBox />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load recycling description.')).toBeInTheDocument();
      expect(screen.getByText('Failed to load description.')).toBeInTheDocument();
      expect(screen.getByText('Failed to load circular economy description.')).toBeInTheDocument();
    });
  });
});