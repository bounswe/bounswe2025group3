import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { ColorPalette } from '@/constants/colors';

// Mock color palette for tests
export const mockLightColors: ColorPalette = {
  primary: '#10632C',
  primary_d: '#B2FF45',
  blue: '#298CF0',
  background: '#F4F7F6',
  borders: '#E8F5E9',
  cb1: '#FFFFFF',
  cb2: '#F3FAF3',
  cb3: '#E9F5E9',
  cb4: '#E1EEE1',
  inactive_button: '#E9F5E9',
  inactive_text: '#595C5C',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E8F5E9',
  success: '#4CAF50',
  error: '#D32F2F',
  sun: '#ffc107',
  black: '#000000',
  white: '#FFFFFF',
};

export const mockDarkColors: ColorPalette = {
  primary: '#B2FF45',
  primary_d: '#B2FF45',
  blue: '#298CF0',
  background: '#0C0D0F',
  borders: '#E8F5E9',
  cb1: '#F0F9F0',
  cb2: '#E1F5E1',
  cb3: '#E5F4E5',
  cb4: '#E1EEE1',
  inactive_button: '#E9F5E9',
  inactive_text: '#595C5C',
  text: '#C8C9CA',
  textSecondary: '#AAAAAA',
  border: '#E8F5E9',
  success: '#4CAF50',
  error: 'red',
  sun: '#ffc107',
  black: '#FFFFFF',
  white: '#FFFFFF',
};

// Mock theme context
export const mockThemeContext = {
  theme: 'light' as 'light' | 'dark' | 'colorBlind',
  isDark: false,
  isColorBlind: false,
  setTheme: jest.fn(),
  setIsColorBlind: jest.fn(),
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed
}

function render(ui: React.ReactElement, options?: CustomRenderOptions) {
  return rtlRender(ui, { ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react-native';
export { render };
