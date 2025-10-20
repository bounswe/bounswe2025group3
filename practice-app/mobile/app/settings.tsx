import { useColors } from '@/constants/colors';
import { ThemeMode, useTheme } from '@/hooks/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, BackHandler} from 'react-native';
import { SafeAreaView} from 'react-native-safe-area-context';
import MultipleChoiceModal from '@/components/ui/multiple-choice';

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { theme, setTheme, isColorBlind, setIsColorBlind } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);

  const themeOptions: ThemeMode[] = ['system', 'light', 'dark'];

  const getThemeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case 'system': return 'System';
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      default: return 'System';
    }
  };

  const handleThemeSelect = (selectedTheme: ThemeMode) => {
    setTheme(selectedTheme);
    setThemeModalVisible(false);
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
      router.back();
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
    
  }, [isThemeModalVisible]); 

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>Notifications</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#767577', true: colors.primary }} thumbColor="white" />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="eye-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>Color-blind Mode</Text>
            </View>
            <Switch value={isColorBlind} onValueChange={setIsColorBlind} trackColor={{ false: '#767577', true: colors.primary }} thumbColor="white" />
          </View>

          <TouchableOpacity style={styles.row} onPress={() => setThemeModalVisible(true)}>
            <View style={styles.rowLabel}>
              <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>Theme</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => Alert.alert("Language", "Language selection will be available soon.")}>
            <View style={styles.rowLabel}>
              <Ionicons name="language-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>Account Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              <Text style={styles.rowText}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text style={[styles.rowText, {color: colors.error}]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MultipleChoiceModal
        visible={isThemeModalVisible}
        title="Choose Theme"
        options={themeOptions.map(getThemeLabel)}
        selectedOption={getThemeLabel(theme)}
        onSelect={(label) => {
          const selected = themeOptions.find(mode => getThemeLabel(mode) === label);
          if (selected) handleThemeSelect(selected);
        }}
        onClose={() => setThemeModalVisible(false)}
      />
    </SafeAreaView>
  );
}
