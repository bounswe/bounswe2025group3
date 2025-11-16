import { useColors } from '@/constants/colors';
import { ThemeMode, useTheme } from '@/hooks/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, BackHandler} from 'react-native';
import { SafeAreaView} from 'react-native-safe-area-context';
import MultipleChoiceModal from '@/components/ui/multiple-choice';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { theme, setTheme, isColorBlind, setIsColorBlind } = useTheme();
  const { i18n: i18nInstance, t } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  const themeOptions: ThemeMode[] = ['system', 'light', 'dark'];
  const languageOptions: string[] = ['en-US', 'tr-TR'];

  const getThemeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case 'system': return t("settings.theme_system");
      case 'light': return t("settings.theme_light");
      case 'dark': return t("settings.theme_dark");
      default: return t("settings.theme_system");
    }
  };

  const getLanguageLabel = (lang: string): string => {
    switch (lang) {
      case 'en-US': return t("settings.language_english");
      case 'tr-TR': return t("settings.language_turkish");
      default: return t("settings.language_english");
    }
  };

  const handleThemeSelect = (selectedTheme: ThemeMode) => {
    setTheme(selectedTheme);
    setThemeModalVisible(false);
  };

  const handleLanguageSelect = async (selectedLanguage: string) => {
    try {
      await i18nInstance.changeLanguage(selectedLanguage);
      await AsyncStorage.setItem('@app_language', selectedLanguage);
      setLanguageModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { height: "6%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders},
    headerTitle: {fontSize: 20, fontWeight: "600", color: colors.text, marginLeft: "5%"},
    headerButton: { padding: 4 },
    contentContainer: { paddingVertical: 8, backgroundColor: colors.background, flexGrow: 1 },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 8, marginLeft: 16 },
    section: { backgroundColor: colors.cb1, borderRadius: 12, borderWidth: 1, borderColor: colors.borders, marginBottom: 24, overflow: 'hidden' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal:16, borderBottomWidth: 1, borderBottomColor: colors.borders },
    rowLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowText: { fontSize: 16, color: colors.text },
  });

  useEffect(() => {
    const onBackPress = () => {
      if (isThemeModalVisible) {
        setThemeModalVisible(false);
        return true;
      }
      if (isLanguageModalVisible) {
        setLanguageModalVisible(false);
        return true;
      }
      router.back();
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
    
  }, [isThemeModalVisible, isLanguageModalVisible]); 

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>{t("settings.general")}</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>{t("settings.notifications")}</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#767577', true: colors.primary }} thumbColor="white" />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="eye-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>{t("settings.color_blind_mode")}</Text>
            </View>
            <Switch value={isColorBlind} onValueChange={setIsColorBlind} trackColor={{ false: '#767577', true: colors.primary }} thumbColor="white" />
          </View>

          <TouchableOpacity style={styles.row} onPress={() => setThemeModalVisible(true)}>
            <View style={styles.rowLabel}>
              <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>{t("settings.theme")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => setLanguageModalVisible(true)}>
            <View style={styles.rowLabel}>
              <Ionicons name="language-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>{t("settings.language")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t("settings.account")}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>{t("settings.account_information")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>{t("settings.privacy_security")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t("settings.danger_zone")}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text style={[styles.rowText, {color: colors.error}]}>{t("settings.delete_account")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MultipleChoiceModal
        visible={isThemeModalVisible}
        title={t("settings.choose_theme")}
        options={themeOptions.map(getThemeLabel)}
        selectedOption={getThemeLabel(theme)}
        onSelect={(label) => {
          const selected = themeOptions.find(mode => getThemeLabel(mode) === label);
          if (selected) handleThemeSelect(selected);
        }}
        onClose={() => setThemeModalVisible(false)}
      />

      <MultipleChoiceModal
        visible={isLanguageModalVisible}
        title={t("settings.choose_language")}
        options={languageOptions.map(getLanguageLabel)}
        selectedOption={getLanguageLabel(i18nInstance.language || 'en-US')}
        onSelect={(label) => {
          const selected = languageOptions.find(lang => getLanguageLabel(lang) === label);
          if (selected) handleLanguageSelect(selected);
        }}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}
