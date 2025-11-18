import { register } from "@/api/auth";
import { useColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/hooks/themeContext";
import * as NavigationBar from 'expo-navigation-bar';
import CustomInfoAlert from "@/components/ui/custom-info-alert";

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

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
        router.replace("/login");
      }, 500);

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
    } catch (error: any) {
      let message = "Sign up failed.";
      if (error.username) { message = error.username[0]; }
      else if (error.email) { message = error.email; }
      else if (error.password2) { message = error.password2; }
      else { message = JSON.stringify(error); }
      setErrorMessage(message);
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
        title="Registration Successful"
        message="Now you can login."
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={48} color="white" />
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.title}>Join the Zero Waste Movement</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor={colors.primary}
          cursorColor={colors.primary}
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.primary}
          cursorColor={colors.primary}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
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
            placeholder="Confirm Password"
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
            Sign Up
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", marginTop: "5%" }}>
          <Text style={{ color: "black" }}>I agree to Greener's </Text>
          <Text
            style={{ fontWeight: "bold", color: colors.blue, borderBottomColor: colors.blue, borderBottomWidth:2 }}
            onPress={() => router.push("/term_condition")}
          >
            Terms and Conditions
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: "14%" }}>
          <Text style={{ color: "#595C5C" }}>Already have an account? </Text>
          <Text
            style={{ fontWeight: "bold", color: colors.primary, borderBottomWidth: 2, borderBottomColor: colors.primary }}
            onPress={handleLoginPress}
          >
            Log in
          </Text>
        </View>
      </View>
    </View>
  );
}