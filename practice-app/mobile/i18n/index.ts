import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from "@react-native-async-storage/async-storage";
import translationEN from './locales/en-US/translations.json';
import translationTR from './locales/tr-TR/translations.json';

const LANGUAGE_KEY = "@app_language";

const resources = {
    "en-US": { translation: translationEN },
    en: { translation: translationEN },
    "tr-TR": { translation: translationTR },
    tr: { translation: translationTR },
};

const initI18n = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

      let selectedLanguage = savedLanguage;
  
      if (!selectedLanguage) {
        const deviceLocales = Localization.getLocales();
        const deviceLocale = deviceLocales[0]?.languageTag || "en-US";
        const languageCode = deviceLocale.split("-")[0];
  
        if (deviceLocale in resources) {
          selectedLanguage = deviceLocale;
        }
  
        else if (languageCode in resources) {
          selectedLanguage = languageCode;
        } else {
          selectedLanguage = "en-US";
        }
      }
  
      await i18n.use(initReactI18next).init({
        resources,
        lng: selectedLanguage,
        fallbackLng: {
          "en-*": ["en-US", "en"],
          "tr-*": ["tr-TR", "tr", "tr-TR"],
          default: ["en-US"],
        },
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
  
      if (!savedLanguage) {
        await AsyncStorage.setItem(LANGUAGE_KEY, selectedLanguage || "en-US");
      }
    } catch (error) {
      console.error("Error initializing i18n:", error);
  
      await i18n.use(initReactI18next).init({
        resources,
        lng: "en-US",
        fallbackLng: "en-US",
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
    }
  };
  
  initI18n();
  
  export default i18n;
