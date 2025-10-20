import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, updateUserProfile } from '@/api/functions';

const FormInput = ({ label, value, onChangeText, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const colors = useColors();
  
  const styles = StyleSheet.create({
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 16, color: colors.textSecondary, marginBottom: 8 },
    input: { backgroundColor: colors.cb4, padding: 12, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: colors.borders, color: colors.text },
    inputFocused: {
      borderColor: colors.primary,
      borderWidth: 1,
    },
  });

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );
};


export default function EditProfileScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const colors = useColors();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 12, paddingBottom: "50%" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { height: "6%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background},
    headerTitle: {fontSize: 20, fontWeight: 600, color: colors.text },
    headerButton: { paddingHorizontal: 4 },
    avatarContainer: { alignSelf: 'center', width: 120, height: 120, borderRadius: 60, backgroundColor: colors.cb1, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 0, overflow: "hidden" },
    cameraIcon: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 30 },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getUserProfile();
        if (data) {
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setBio(data.bio || '');
          setCity(data.city || '');
          setCountry(data.country || '');
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      bio,
      city,
      country,
    };
    try {
      await updateUserProfile(profileData);
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Failed to save profile", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={26} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isSaving}>
              {isSaving ? <ActivityIndicator size="small" /> : <Ionicons name="checkmark" size={26} color={colors.primary} />}
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps= "always">
          <ImageBackground style={styles.avatarContainer} source={require("@/assets/images/kageaki.png")} resizeMode='contain'>
              <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Profile picture uploads will be available in a future update.")}>
                  <Ionicons name="camera-outline" size={32} color="white" style={styles.cameraIcon}/>
              </TouchableOpacity>
          </ImageBackground>

          <FormInput label="First Name (Optional)" value={firstName} onChangeText={setFirstName} placeholder="Your first name" />
          <FormInput label="Last Name (Optional)" value={lastName} onChangeText={setLastName} placeholder="Your last name" />
          <FormInput label="Bio (Optional)" value={bio} onChangeText={setBio} placeholder="Tell us about yourself" multiline />
          <FormInput label="City (Optional)" value={city} onChangeText={setCity} placeholder="Your city" />
          <FormInput label="Country (Optional)" value={country} onChangeText={setCountry} placeholder="Your country" marginBottom={"40%"} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
