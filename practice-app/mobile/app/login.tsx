import { login } from "@/api/auth";
import { useColors } from "@/constants/colors";
import { useSession } from "@/hooks/authContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";

export default function LoginScreen() {
  const { signIn } = useSession();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {width:"100%", height:"80%", justifyContent:'flex-start', alignItems:'center', backgroundColor:colors.white, borderTopLeftRadius:80},
    backButton: {width:"14%", marginBottom:"14%", marginLeft:"4%", backgroundColor:"transparent"},
    title: {fontSize:32, fontWeight:"bold", marginTop:"8%", marginBottom:"6%", alignSelf:"center", color:colors.primary},
    forgot_text: {fontSize:15, color: colors.blue, marginLeft:"5%", alignSelf:"flex-start"},
    input: {width:'90%', height:"6%", backgroundColor:colors.cb3, borderRadius:8, paddingHorizontal:12, fontSize:16, color:'#000', marginBottom:"6%"},
    passwordContainer: {flexDirection:'row', height: "6%", alignItems:'center', width:'90%', backgroundColor:colors.cb3, borderRadius:8, marginBottom:"6%", paddingHorizontal:12},
    passwordInput: {flexGrow:1, fontSize:16, color:'#000'},
    eyeIcon: {paddingHorizontal:4},
    loginButton: {width:"90%", height:"6%", borderRadius:24, justifyContent:"center", alignItems:"center", marginTop:"2%"},
    otherButton: {width:"90%", borderWidth:1, borderColor:"#ccc", borderRadius:24, paddingVertical:10, paddingHorizontal:20, alignItems:"center", justifyContent:"center", marginTop:"3%"},
    logo: {width:20, height:20, marginRight:10},
    logo_text: {fontSize:16, fontWeight:"500"},
    errorText: {color:colors.error, textAlign:'center', fontSize:14, marginTop: "4%"},
  });

  const validateEmail = (text: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const handleLoginPress = async () => {
    console.log("login button pressed");
    setErrorMessage('');
    try {
      const data = await login(email, password);
      console.log("Login successful", data);
      signIn(data.role);
    } catch (error: any) {
      console.log(error);
      setErrorMessage(error.message || "Login failed. Please check your credentials.");
    }
  };

  const handleRegisterPress = () => router.replace("/register");
  const handleForgotPasswordPress = () => router.replace("/forgot_password");

  const isLoginEnabled = email.length > 0 && password.length > 0 && validateEmail(email);

  return (
    <View style={{flex:1, justifyContent:"flex-end", backgroundColor:"transparent"}}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={48} color="white" />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>

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
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.forgot_text} onPress={handleForgotPasswordPress}>
          Forgot Password?
        </Text>

        <Text style={[styles.errorText, {opacity: errorMessage ? 1 : 0}]}>
          {errorMessage || ''}
        </Text>

        <TouchableOpacity
          style={[styles.loginButton, {backgroundColor:isLoginEnabled ? colors.primary : colors.cb3}]}
          disabled={!isLoginEnabled}
          onPress={handleLoginPress}
        >
          <Text style={{color:isLoginEnabled ? '#fff' : '#595C5C', fontWeight:'bold'}}>Login</Text>
        </TouchableOpacity>

        <Text style={{fontSize:14, color:"#595C5C", fontWeight:"300", marginTop:"5%"}}>Or continue with</Text>

        <TouchableOpacity style={styles.otherButton}>
          <View style={{flexDirection:"row"}}>
            <Image source={require('@/assets/images/google.png')} style={styles.logo} />
            <Text style={styles.logo_text}>Google</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.otherButton}>
          <View style={{flexDirection:"row"}}>
            <Image
              source={colorScheme === "dark" ? require('@/assets/images/github_dark.png') : require('@/assets/images/github.png')}
              style={styles.logo}
            />
            <Text style={styles.logo_text}>Github</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.otherButton}>
          <View style={{flexDirection:"row"}}>
            <Image source={require('@/assets/images/linkedin.png')} style={styles.logo} />
            <Text style={styles.logo_text}>LinkedIn</Text>
          </View>
        </TouchableOpacity>

        <View style={{flexDirection:"row", marginTop:"8%"}}>
          <Text style={{color:"#595C5C"}}>Don’t have an account? </Text>
          <Text
            style={{fontWeight:"bold", color:colors.primary, borderBottomWidth:2, borderBottomColor:colors.primary}}
            onPress={handleRegisterPress}
          >
            Sign Up
          </Text>
        </View>
      </View>
    </View>
  );
}