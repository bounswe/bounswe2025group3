import { useColors } from '@/constants/colors';
import tokenManager from '@/services/tokenManager';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_ENDPOINTS } from '@/constants/api';
import { useTranslation } from 'react-i18next';

const CustomAlert = ({ visible, title, message, type, onClose, t }: any) => {
    if (!visible) return null;
    return (
        <View style={{ position: 'absolute', top: 50, left: 20, right: 20, padding: 20, backgroundColor: type === 'success' ? 'green' : 'red', borderRadius: 10 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{title}</Text>
            <Text style={{ color: 'white' }}>{message}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ color: 'white', marginTop: 10 }}>{t("category_request.close")}</Text></TouchableOpacity>
        </View>
    );
};

export default function CustomCategoryRequestScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const router = useRouter();
  const colors = useColors();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: { height: "7%", paddingHorizontal: "4%", paddingTop: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 600, color: colors.text, marginLeft: 12 },
    headerSpacer: { flex: 1 },
    content: { flex: 1, padding: 20 },
    form: { gap: 24 },
    infoBox: { flexDirection: 'row', backgroundColor: colors.cb1, padding: 16, borderRadius: 12, gap: 12, marginBottom: 8 },
    infoText: { flex: 1, color: colors.primary, fontSize: 14, lineHeight: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 16, fontWeight: '500', color: colors.text },
    input: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.borders, borderRadius: 8, padding: 12, fontSize: 16, color: colors.text },
    textArea: { height: 100, textAlignVertical: 'top' },
    submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    submitButtonDisabled: { backgroundColor: colors.cb4 },
    submitButtonText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleSubmit = async () => {
    if (!name || !unit) {
      showAlert(t("category_request.error_title"), t("category_request.missing_fields"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await tokenManager.authenticatedFetch(API_ENDPOINTS.WASTE.CATEGORY_REQUEST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          unit,
        }),
      });

      if (response.ok) {
        showAlert(t("category_request.success_title"), t("category_request.request_submitted"), 'success');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        const error = await response.json();
        showAlert(t("category_request.error_title"), error.detail || t("category_request.submit_error"));
      }
    } catch (error) {
      showAlert(t("category_request.error_title"), t("category_request.submit_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("category_request.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                {t("category_request.info_message")}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("category_request.category_name")}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t("category_request.category_name_placeholder")}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("category_request.description")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={t("category_request.description_placeholder")}
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("category_request.unit")}</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder={t("category_request.unit_placeholder")}
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!name || !unit || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!name || !unit || isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? t("category_request.submitting") : t("category_request.submit_request")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
        t={t}
      />
    </SafeAreaView>
  );
}