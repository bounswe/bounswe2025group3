import { register } from "@/api/auth";
import { ApiError } from "@/api/utils";
import { useColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/hooks/themeContext";
import * as NavigationBar from 'expo-navigation-bar';
import CustomInfoAlert from "@/components/ui/custom-info-alert";
import { useTranslation } from "react-i18next";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const colors = useColors();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
        router.replace("/login");
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  const styles = StyleSheet.create({
    container: { width: "100%", height: "80%", justifyContent: 'flex-start', alignItems: 'center', backgroundColor: colors.white, borderTopLeftRadius: 80 },
    backButton: { width: "14%", marginBottom: "14%", marginLeft: "4%", backgroundColor: "transparent" },
    title: { fontSize: 24, color: colors.primary, fontWeight: "bold", marginTop: "8%", marginBottom: "9%", alignSelf: "center", marginLeft: "5%" },
    passwordContainer: { flexDirection: 'row', height: "6%", alignItems: 'center', width: '90%', backgroundColor: colors.cb3, borderRadius: 8, marginBottom: "6%", paddingHorizontal: 12 },
    passwordInput: { flexGrow: 1, fontSize: 16, color: '#000' },
    input: { width: '90%', height: "6%", backgroundColor: colors.cb3, borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#000', marginBottom: "5%" },
    SignupButton: { width: "90%", height: "6%", borderRadius: 24, justifyContent: "center", alignItems: "center", marginTop: "3%" },
    errorText: { color: colors.error, textAlign: 'center', fontSize: 14, marginTop: "9%" },
    eyeIcon: { paddingHorizontal: 4 },
  });

  const validateEmail = (text: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isDark) {
        NavigationBar.setButtonStyleAsync('light');
      } else {
        NavigationBar.setButtonStyleAsync('dark');
      }
    }, [isDark])
  );

  const handleRegisterPress = async () => {
    try {
      await register(username, email, password, confirmPassword);
      setErrorMessage('');
      setShowSuccessAlert(true);
    } catch (error: unknown) {
      // ÇÖZÜM:
      // 'error', 'parseJson' tarafından gönderilen ApiError'dur.
      // 'error.message' ise extractMessage'in bize verdiği temiz string'dir.
      // Payload'ı burada tekrar parse etmene gerek YOK.
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        // Her ihtimale karşı varsayılan bir mesaj
        setErrorMessage(t("register.register_failed"));
      }
    }
  };

  const handleLoginPress = () => {
    router.replace("/login");
  };

  const isRegisterEnabled = validateEmail(email) && username.length > 0 && email.length > 0 && password.length > 0 && confirmPassword.length > 0;

  return (
    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" }}>
      <CustomInfoAlert
        visible={showSuccessAlert}
        title={t("register.registration_successful")}
        message={t("register.can_login_now")}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={48} color="white" />
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.title}>{t("register.title")}</Text>

        <TextInput
          placeholder={t("register.username")}
          placeholderTextColor={colors.primary}
          cursorColor={colors.primary}
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder={t("login.email")}
          placeholderTextColor={colors.primary}
          cursorColor={colors.primary}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder={t("login.password")}
            placeholderTextColor={colors.primary}
            cursorColor={colors.primary}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder={t("register.confirm_password")}
            placeholderTextColor={colors.primary}
            cursorColor={colors.primary}
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.errorText, { opacity: errorMessage ? 1 : 0 }]}>
          {errorMessage || ' '}
        </Text>

        <TouchableOpacity
          style={[
            styles.SignupButton,
            { backgroundColor: isRegisterEnabled ? colors.primary : colors.cb3 }
          ]}
          disabled={!isRegisterEnabled}
          onPress={handleRegisterPress}
        >
          <Text style={{ color: isRegisterEnabled ? '#fff' : '#595C5C', fontWeight: 'bold' }}>
            {t("register.register_button")}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", marginTop: "5%" }}>
          <Text style={{ color: "black" }}>{t("register.agree_terms_prefix")} </Text>
          <Text
            style={{ fontWeight: "bold", color: colors.blue, borderBottomColor: colors.blue, borderBottomWidth:2 }}
            onPress={() => router.push("/term_condition")}
          >
            {t("register.terms_and_conditions")}
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: "14%" }}>
          <Text style={{ color: "#595C5C" }}>{t("register.already_have_account")} </Text>
          <Text
            style={{ fontWeight: "bold", color: colors.primary, borderBottomWidth: 2, borderBottomColor: colors.primary }}
            onPress={handleLoginPress}
          >
            {t("register.log_in_link")}
          </Text>
        </View>
      </View>
    </View>
  );
}