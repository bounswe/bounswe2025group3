import { getUserProfile } from "@/api/functions";
import CustomAlert from "@/components/ui/custom-alert";
import { useColors } from "@/constants/colors";
import { useSession } from "@/hooks/authContext";
import tokenManager from "@/services/tokenManager";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  city: string;
  country: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  date_joined: string;
  notifications_enabled: boolean;
}

const calculateAccountAge = (dateJoined: string) => {
  const joinDate = new Date(dateJoined);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days old`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} old`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} old`;
  }
};

export default function MenuDrawerScreen() {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [AlertVisible, setAlertVisible] = useState(false);
  const { userRole, signOut } = useSession();
  const colors = useColors();

  const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 999 },
    backdropTouchable: { ...StyleSheet.absoluteFillObject },
    drawer: { position: "absolute", right: 0, top: 0, bottom: 0, width: "75%", backgroundColor: colors.background, paddingTop: "15%", paddingHorizontal: 10, zIndex: 1000 },
    profileSection: { alignItems: "center", marginBottom: 30 },
    avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary, marginBottom: 12 },
    username: { fontSize: 18, fontWeight: "700", color: colors.black, marginBottom: 4 },
    userSubtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
    roleContainer: { alignItems: "center", marginTop: 8 },
    accountAge: { fontSize: 11, color: colors.textSecondary, marginTop: 4, fontWeight: "500" },
    divider: { height: 1, backgroundColor: colors.borders, marginBottom: 20 },
    menuButton: { width: "100%", paddingVertical: 14, paddingHorizontal: 8, borderRadius: 12, marginBottom: 8, backgroundColor: "transparent", justifyContent: "center", alignItems: "flex-start" },
    menuButtonContent: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%" },
    menuText: { fontSize: 16, color: colors.black, fontWeight: "400", marginLeft: 12 },
  });

  const RoleBadge = ({ role, accountAge }: { role: "USER" | "MODERATOR" | "ADMIN"; accountAge?: string }) => {
    const getRoleColors = (role: string) => {
      switch (role) {
        case "USER":
          return ["#1B3F17", '#23E925']; // Green
        case "MODERATOR":
          return ["#1A273F", '#8A88EA']; // Purple
        case "ADMIN":
          return ["#5E1B07", '#F89707']; // Orange
        default:
          return ["#1B3F17", '#23E925'];
      }
    };
    const [bColor, tColor] = getRoleColors(role);
    return (
      <View style={styles.roleContainer}>
        <Text style={{paddingVertical:4, paddingHorizontal: 12, color: tColor, backgroundColor: bColor, borderColor: tColor, borderWidth: 1, borderRadius: 16, fontWeight: 600}} >{role}</Text>
        {accountAge && (
          <Text style={styles.accountAge}>{accountAge}</Text>
        )}
      </View>
    );
  };

  const handleLogout = async () => {
    await tokenManager.clearTokens();
    signOut();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (AlertVisible) {
        setAlertVisible(false);
        return true;
      }
      handleClose();
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
    
  }, [AlertVisible]); 

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
        pointerEvents="auto"
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.profileSection}>
          <Image source={require("@/assets/images/kageaki.png")} style={styles.avatar} />
          <Text style={styles.username}>
            {isLoading ? "Loading..." : userProfile?.username || "User"}
          </Text>
          {userProfile?.role && (
            <RoleBadge 
              role={userProfile.role} 
              accountAge={userProfile.date_joined ? calculateAccountAge(userProfile.date_joined) : undefined}
            />
          )}
        </View>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => router.replace('/(tabs)/home/achievements')}
        >
          <View style={styles.menuButtonContent}>
            <Ionicons name="trophy" size={20} color={colors.black} />
            <Text style={styles.menuText}>Achievements</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => router.replace("/(tabs)/home/profile")}
        >
          <View style={styles.menuButtonContent}>
            <Ionicons name="person" size={20} color={colors.black} />
            <Text style={styles.menuText}>Profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => router.replace('/settings')}
        >
          <View style={styles.menuButtonContent}>
            <Ionicons name="settings" size={20} color={colors.black} />
            <Text style={styles.menuText}>Settings</Text>
          </View>
        </TouchableOpacity>

        {userRole === "ADMIN" && (
          <TouchableOpacity 
            style={{paddingVertical:4, paddingHorizontal: 12, borderColor: "#F89707", borderWidth: 1, borderRadius: 16}}
            onPress={() => router.replace("/(tabs)/home/admin")}
          >
            <View style={styles.menuButtonContent}>
              <Ionicons name="construct" size={20} color="#F89707" />
              <Text style={{color: "#F89707"}}>Admin Page</Text>
            </View>
          </TouchableOpacity>
        )}


        <TouchableOpacity 
          style={[styles.menuButton, { marginTop: "80%"}]}
          onPress={() => setAlertVisible(true)}
        >
          <View style={styles.menuButtonContent}>
            <Ionicons name="log-out" size={20} color={colors.error} />
            <Text style={[styles.menuText, { color: colors.error }]}>Logout</Text>
          </View>
        </TouchableOpacity>
        
      </Animated.View>
      <CustomAlert
        visible = {AlertVisible}
        onClose = {() => setAlertVisible(false)}
        onConfirm={handleLogout}
        title = "Logout"
        message = "Are you sure you want to logout?"
        confirmText="Logout"
      />
    </View>
  );
}