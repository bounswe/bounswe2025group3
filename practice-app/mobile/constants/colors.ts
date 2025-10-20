import { useTheme } from "../hooks/themeContext";
export interface ColorPalette {
  primary: string;
  primary_d: string;

  blue: string;

  background: string;
  borders: string;

  cb1: string;
  cb2: string;

  inactive_button: string;
  inactive_text: string;
  
  text: string;
  textSecondary: string;
  
  border: string;
  
  success: string;
  error: string;
  sun: string;
  black: string;
}

const lightColors: ColorPalette = {
  primary: '#10632C',      // Ana koyu yeşil rengi, 2ECC71
  primary_d: '#B2FF45', // açık neon-sarımsı yeşil, USED IN EXTREME CASES

  blue: '#298CF0', // When blue is required, for example links etc

  inactive_button: '#E9F5E9', // when buttons are inactive, its primary when active
  inactive_text: '#595C5C',  // the color of the text when the button is inactive

  background: '#ffffff',        // Ana sayfa arka planı
  borders: '#E8F5E9',  // Çok açık yeşil (Kenarlıklar, ikon arka planları)
  cb1: "#F0F9F0",  // section, card area first layer color
  cb2: "#E1F5E1", // section card area second layer color.

  // === Metin Renkleri ===
  text: '#333333',         // Ana metin rengi (Koyu Gri)
  textSecondary: '#666666', // İkincil metinler (Orta Gri)

  // === Diğer UI Elemanları ===
  border: '#E8F5E9',                // Kenarlıklar için (Çok Açık Yeşil ile aynı)

  // === Durum Renkleri ===
  success: '#4CAF50', // Başarı bildirimleri için
  error: '#D32F2F',   // Hata bildirimleri için
  sun: "#ffc107",
  black: "#000000",

};
  
const darkColors: ColorPalette = {
  // === Ana Marka Renkleri ===
  primary: '#B2FF45',      // Ana koyu yeşil rengi
  primary_d: '#B2FF45', // açık neon-sarımsı yeşil, USED IN EXTREME CASES

  blue: '#298CF0', // When blue is required, for example links etc

  inactive_button: '#E9F5E9', // when buttons are inactive, its primary when active
  inactive_text: '#595C5C',  // the color of the text when the button is inactive

  background: '#0C0D0F',        // Ana sayfa arka planı
  borders: '#E8F5E9',  // Çok açık yeşil (Kenarlıklar, ikon arka planları)
  cb1: "#F0F9F0",  // section, card area first layer color
  cb2: "#E1F5E1", // section card area second layer color.

  // === Metin Renkleri ===
  text: '#C8C9CA',         // Ana metin rengi (Koyu Gri)
  textSecondary: '#AAAAAA', // İkincil metinler (Orta Gri)

  // === Diğer UI Elemanları ===
  border: '#E8F5E9',                // Kenarlıklar için (Çok Açık Yeşil ile aynı)

  // === Durum Renkleri ===
  success: '#4CAF50', // Başarı bildirimleri için
  error: 'red',   // Hata bildirimleri için
  sun: "#ffc107",
  black: "#FFFFFF",
};

// Red-Green color blindness 
const colorBlindColors: ColorPalette = {
  primary: '#10632C',
  primary_d: '#B2FF45',

  blue: '#298CF0',

  inactive_button: '#E9F5E9',
  inactive_text: '#595C5C',

  background: '#ffffff',
  borders: '#E8F5E9',
  cb1: "#F0F9F0", 
  cb2: "#E1F5E1",

  text: '#333333',
  textSecondary: '#666666',

  border: '#E8F5E9',

  success: '#4CAF50',
  error: '#7500FA',   // Purple
  sun: "#ffc107",
  black: "#000000",
};


export const useColors = () => {
  const { isDark, theme, isColorBlind } = useTheme();
  if (isColorBlind || theme === 'colorBlind') return colorBlindColors;
  return isDark ? darkColors : lightColors;
}
