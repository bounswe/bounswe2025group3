import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark' | 'colorBlind';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  isColorBlind: boolean;
  setIsColorBlind: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isColorBlind, setIsColorBlindState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useColorScheme();

  // Load theme when app opens
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme') as ThemeMode;
        if (savedTheme) {
          setThemeState(savedTheme);
        }
        const savedColorBlind = await AsyncStorage.getItem('colorBlindEnabled');
        if (savedColorBlind != null) {
          setIsColorBlindState(savedColorBlind === 'true');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Set theme when it is changed
  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setIsColorBlind = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('colorBlindEnabled', enabled ? 'true' : 'false');
      setIsColorBlindState(enabled);
    } catch (error) {
      console.error('Error saving color-blind preference:', error);
    }
  };

  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, isColorBlind, setIsColorBlind }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}