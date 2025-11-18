import React from 'react';
import { render } from '@testing-library/react-native';
import { SplashScreenController } from '../splash';
import { SplashScreen } from 'expo-router';

// Mock expo-router SplashScreen
jest.mock('expo-router', () => ({
  SplashScreen: {
    hideAsync: jest.fn(),
  },
}));

// Mock useSession
const mockUseSession = jest.fn();
jest.mock('../authContext', () => ({
  useSession: () => mockUseSession(),
}));

describe('SplashScreenController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should hide splash when not loading', () => {
    mockUseSession.mockReturnValue({ isLoading: false });

    render(<SplashScreenController />);

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it('should not hide splash when loading', () => {
    mockUseSession.mockReturnValue({ isLoading: true });

    render(<SplashScreenController />);

    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });
});

