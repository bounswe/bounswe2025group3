import { useColors } from '@/constants/colors';
import { ThemeMode, useTheme } from '@/hooks/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsRowProps {
  icon: any;
  label: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
}

const SettingsRow = ({ icon, label, hasSwitch, switchValue, onSwitchChange, onPress }: SettingsRowProps) => {
  const colors = useColors();
  const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal:16, borderBottomWidth: 1, borderBottomColor: colors.borders},
    labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    labelText: { fontSize: 16, color: colors.text },
  });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={hasSwitch}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={22} color={colors.primary} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      {hasSwitch ? (
        <Switch 
          value={switchValue} 
          onValueChange={onSwitchChange} 
          trackColor={{ false: '#767577', true: colors.primary }} 
          thumbColor="white" 
        />
      ) : (
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { theme, setTheme, isColorBlind, setIsColorBlind } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  
  const insets = useSafeAreaInsets();

  const themeOptions: ThemeMode[] = ['system', 'light', 'dark'];

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'system': return 'System';
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
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
    contentContainer: { 
      paddingVertical: 8, 
      backgroundColor: colors.cb1,
      flexGrow: 1, 
    },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 8, marginLeft: 16 },
    section: { backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.borders, marginBottom: 24, overflow: 'hidden' },
    modalContent: { 
      backgroundColor: colors.background, 
      borderTopLeftRadius: 5, 
      borderTopRightRadius: 5, 
      padding: 15,
      paddingBottom: insets.bottom,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10, textAlign: 'center' },
    themeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cb1, paddingVertical: 14, paddingHorizontal: 10, marginBottom: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borders },
    themeOptionSelected: {borderColor: colors.primary },
    themeOptionText: { fontSize: 16, color: colors.text, fontWeight: 500 },
    radioButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.borders, justifyContent: 'center', alignItems: 'center' },
    radioButtonSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
    radioButtonInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.background },
    closeButton: { marginTop: 20, paddingVertical: 14, backgroundColor: colors.cb1, borderRadius: 10, borderWidth: 1, borderColor: colors.borders },
    closeButtonText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.text },
  });

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
              <SettingsRow icon="notifications-outline" label="Notifications" hasSwitch switchValue={notifications} onSwitchChange={setNotifications} />
              <SettingsRow icon="eye-outline" label="Color-blind Mode" hasSwitch switchValue={isColorBlind} onSwitchChange={setIsColorBlind} />
              <SettingsRow icon="color-palette-outline" label="Theme" onPress={() => setThemeModalVisible(true)} />
              <SettingsRow icon="language-outline" label="Language" onPress={() => Alert.alert("Language", "Language selection will be available soon.")} />
          </View>

          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.section}>
              <SettingsRow icon="person-circle-outline" label="Account Information" />
              <SettingsRow icon="shield-checkmark-outline" label="Privacy & Security" />
          </View>

          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.section}>
              <SettingsRow icon="trash-outline" label="Delete Account" />
          </View>
      </ScrollView>

      <Modal
        isVisible={isThemeModalVisible}
        onBackdropPress={() => setThemeModalVisible(false)}
        onBackButtonPress={() => setThemeModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={250}
        animationOutTiming={250}
        useNativeDriver={true}
        useNativeDriverForBackdrop={true}
        hideModalContentWhileAnimating={true}
        renderToHardwareTextureAndroid
        backdropTransitionOutTiming={1}
        backdropOpacity={0.2}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Theme</Text>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.themeOption,
                theme === option && styles.themeOptionSelected,
              ]}
              onPress={() => handleThemeSelect(option)}
            >
              <Text style={styles.themeOptionText}>
                {getThemeLabel(option)}
              </Text>
              <View style={[
                  styles.radioButton,
                  theme === option && styles.radioButtonSelected,
                ]}
              >
                {theme === option && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

