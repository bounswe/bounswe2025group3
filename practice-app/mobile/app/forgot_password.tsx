import { reset_password } from "@/api/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordScreen(){
  const router = useRouter();
  const [email, setEmail] = useState("");

  const validateEmail = (text: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };
  const isButtonEnabled = validateEmail(email);

  const handleSendResetLinkPress = async() => {
    console.log("Reset password button pressed");
    try {
      const data = await reset_password(email);
      console.log("Password reset api call successful", data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginPress = () => {
    router.replace("/login");
  };


  return (

    <View style= {{flex: 1, justifyContent: "flex-end", backgroundColor: "transparent"}}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={48} color="white" />
      </TouchableOpacity>
      <View style={styles.container}>
      
      <Text style={styles.title}>Forgot Your Password?</Text>
      <Text style={styles.title2}>No worries! Enter your email address below, and we'll send you a link to reset your password.</Text>

      <TextInput
        placeholder="Email Adress"
        placeholderTextColor="#10A674"
        cursorColor="#10A674"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[
          styles.loginButton,
          { backgroundColor: isButtonEnabled ? '#10632C' : '#E9F5E9'}
        ]}
        disabled={!isButtonEnabled}
        onPress={handleSendResetLinkPress}
      >
        <Text style={{ color: isButtonEnabled ? '#fff' : '#595C5C', fontWeight: 'bold' }}>
          Send Reset Link
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", marginTop: "8%" }}>
        <Text style={{ color: "#595C5C" }}>Remember your password? </Text>
        <Text
          style={{ fontWeight: "bold", color: "#10632C", borderBottomWidth: 2, borderBottomColor: "#10632C" }}
          onPress={handleLoginPress}
        >
          Log in
        </Text>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      width: "100%",
      height: "80%",
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderTopLeftRadius: 80,
    },
    backButton: {
      width: "14%",
      marginBottom: "14%",
      marginLeft: "4%", 
      backgroundColor: "transparent",
    },
  
    title: {
      fontSize: 32,
      color: "#10632C",
      fontWeight: "bold",
      marginTop: "8%",
      marginBottom: "6%",
      alignSelf: "center",
      marginLeft: "5%",
    },
    title2:{
      fontSize: 16,
      color: "#595C5C",
      fontWeight: "400",
      marginTop: "8%",
      marginBottom: "6%",
      alignSelf: "center",
      marginLeft: "5%",
    },
  
    texts: {
      fontSize: 16,
      color: "#838387",
      marginLeft: "5%",
      alignSelf: "flex-start",
      marginBottom: "10%"
    },
  
    input: {
      width: '90%',
      height: "6%",
      backgroundColor: '#E9F5E9', //E9F5E9 can be used for slight green
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: '#000',
      marginBottom: "6%",
    },
  
    loginButton: {
      width: "90%",
      height: "7%",
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginTop: "12%",
    },
  });