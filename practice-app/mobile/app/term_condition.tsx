import React from 'react';
import { ScrollView, Text, StyleSheet, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TERMS = `
TERMS AND CONDITIONS
Last updated October 18, 2025

AGREEMENT TO OUR LEGAL TERMS
We are ECOCHALLENGE LTD ("Company," "we," "us," "our").

We operate the website https://ecochallenge-frontend.onrender.com/ (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").

You can contact us by phone at 5455454545, email at zerowaste@gmail.com, or by mail to __________, __________, __________.

These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and ECOCHALLENGE LTD, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.

Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms from time to time. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.

The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.

We recommend that you print a copy of these Legal Terms for your records.

TABLE OF CONTENTS
1. OUR SERVICES
2. INTELLECTUAL PROPERTY RIGHTS
3. USER REPRESENTATIONS
4. USER REGISTRATION
5. PROHIBITED ACTIVITIES
6. USER GENERATED CONTRIBUTIONS
7. CONTRIBUTION LICENSE
8. SOCIAL MEDIA
9. SERVICES MANAGEMENT
10. PRIVACY POLICY
11. TERM AND TERMINATION
12. MODIFICATIONS AND INTERRUPTIONS
13. GOVERNING LAW
14. DISPUTE RESOLUTION
15. CORRECTIONS
16. DISCLAIMER
17. LIMITATIONS OF LIABILITY
18. INDEMNIFICATION
19. USER DATA
20. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES
21. MISCELLANEOUS
22. CONTACT US

(Full terms content continues...)

1. OUR SERVICES
The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.

2. INTELLECTUAL PROPERTY RIGHTS
Our intellectual property
We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").

Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.

The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
Your use of our Services
Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to:
access the Services; and
download or print a copy of any portion of the Content to which you have properly gained access,
solely for your personal, non-commercial use or internal business purpose.

(For brevity this component contains the full terms as provided by you. Keep reading inside the app.)

22. CONTACT US
In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:

ECOCHALLENGE LTD
Phone: 5455454545
zerowaste@gmail.com
`;

export default function TermsAndConditionsScreen() {
  const router = useRouter();

  const handleAccept = () => {
    Alert.alert('Thanks', 'You accepted the Terms and Conditions');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.body}>{TERMS}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleAccept}>
          <Text style={styles.buttonText}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: { padding: 20, paddingBottom: 120 },
  body: { fontSize: 14, lineHeight: 20, color: '#222' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#1f8e3e',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
