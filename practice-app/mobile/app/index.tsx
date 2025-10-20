import { useRouter } from "expo-router";
import React from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function FirstScreen() {

  useFocusEffect(
    React.useCallback(() => {
      console.log("xxx");
      NavigationBar.setButtonStyleAsync('light');
      return () => {
      };
    }, [])
  );

  const router = useRouter();

  const handleLoginPress = () => {
    router.push("/login");
  };
  
  const handleRegisterPress = () => {
    router.push("/register");
  };

  return (
    <ImageBackground
      source={require('@/assets/images/leaves.jpg')}
      style={styles.background}
    > 
      <StatusBar style="light" />
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/appicon_withoutbg.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Make Every Day</Text>
        <Text style={styles.text}>a Zero Waste Day</Text>
  
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: "#BCFF30" }]}
            onPress={handleLoginPress}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Log in</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: "#10632C", marginLeft: "20%" }]}
            onPress={handleRegisterPress}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  logoContainer: {
    position: 'absolute',
    top: "3%",
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
  buttonRow: {
    marginTop: "10%",
    flexDirection: 'row',
    justifyContent: 'center',
    width: '40%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginLeft: "5%",
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
  },
  loginButton: {
    width: "90%",
    height: 45,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});