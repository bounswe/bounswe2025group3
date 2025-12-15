import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, updateUserProfile } from '@/api/user';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { Country, State } from 'country-state-city';

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

const FormSelect = ({ label, value, onValueChange, items, enabled = true, placeholder }: any) => {
  const colors = useColors();
  
  const styles = StyleSheet.create({
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 16, color: colors.textSecondary, marginBottom: 8 },
    pickerContainer: { 
      backgroundColor: colors.cb4, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: colors.borders,
      overflow: 'hidden',
    },
    picker: { 
      height: 50,
      color: colors.text,
    },
    pickerDisabled: {
      opacity: 0.5,
    },
  });

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerContainer, !enabled && styles.pickerDisabled]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={enabled}
          style={styles.picker}
          dropdownIconColor={colors.text}
        >
          <Picker.Item label={placeholder || 'Select...'} value="" />
          {items.map((item: any) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
};


export default function EditProfileScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const colors = useColors();
  const { t } = useTranslation();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

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
          
          // Try to find country code from country name
          if (data.country) {
            const foundCountry = Country.getAllCountries().find(
              c => c.name === data.country
            );
            if (foundCountry) {
              setSelectedCountryCode(foundCountry.isoCode);
              
              // Try to find state code from city name (city is actually state name in our system)
              if (data.city) {
                const states = State.getStatesOfCountry(foundCountry.isoCode);
                const foundState = states.find(s => s.name === data.city);
                if (foundState) {
                  setSelectedStateCode(foundState.isoCode);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
        Alert.alert(t("edit_profile.error_title"), t("edit_profile.load_error"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [t]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const country = Country.getCountryByCode(countryCode);
    setCountry(country ? country.name : '');
    setSelectedStateCode('');
    setCity('');
  };

  const handleStateChange = (stateCode: string) => {
    setSelectedStateCode(stateCode);
    const state = State.getStateByCodeAndCountry(stateCode, selectedCountryCode);
    // State name is stored as city (web site compatibility)
    setCity(state ? state.name : '');
  };

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
      Alert.alert(t("edit_profile.success_title"), t("edit_profile.update_success"));
      router.back();
    } catch (error) {
      console.error("Failed to save profile", error);
      Alert.alert(t("edit_profile.error_title"), t("edit_profile.update_error"));
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
          <Text style={styles.headerTitle}>{t("edit_profile.title")}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isSaving}>
              {isSaving ? <ActivityIndicator size="small" /> : <Ionicons name="checkmark" size={26} color={colors.primary} />}
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps= "always">
          <ImageBackground style={styles.avatarContainer} source={require("@/assets/images/kageaki.png")} resizeMode='contain'>
              <TouchableOpacity onPress={() => Alert.alert(t("edit_profile.coming_soon"), t("edit_profile.profile_picture_message"))}>
                  <Ionicons name="camera-outline" size={32} color="white" style={styles.cameraIcon}/>
              </TouchableOpacity>
          </ImageBackground>

          <FormInput label={t("edit_profile.first_name")} value={firstName} onChangeText={setFirstName} placeholder={t("edit_profile.first_name_placeholder")} />
          <FormInput label={t("edit_profile.last_name")} value={lastName} onChangeText={setLastName} placeholder={t("edit_profile.last_name_placeholder")} />
          <FormInput label={t("edit_profile.bio")} value={bio} onChangeText={setBio} placeholder={t("edit_profile.bio_placeholder")} multiline />
          
          <FormSelect
            label={t("edit_profile.country")}
            value={selectedCountryCode}
            onValueChange={handleCountryChange}
            items={Country.getAllCountries().map(country => ({
              label: country.name,
              value: country.isoCode,
            }))}
            placeholder={t("edit_profile.country_placeholder")}
          />
          
          <FormSelect
            label={t("edit_profile.state")}
            value={selectedStateCode}
            onValueChange={handleStateChange}
            items={selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode).map(state => ({
              label: state.name,
              value: state.isoCode,
            })) : []}
            enabled={!!selectedCountryCode}
            placeholder={t("edit_profile.state_placeholder")}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
