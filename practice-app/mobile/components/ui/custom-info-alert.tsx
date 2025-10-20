import { useColors } from '@/constants/colors';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface CustomInfoAlertProps {
  visible: boolean;
  title: string;
  message: string;
}

const CustomInfoAlert: React.FC<CustomInfoAlertProps> = ({
  visible,
  title,
  message,
}) => {
  const colors = useColors();

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      zIndex: 9999,
    },
    modalView: {
      backgroundColor: 'white',
      borderRadius: 16,
      alignItems: 'center',
      width: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      overflow: 'hidden',
    },
    contentContainer: {
      padding: 24,
      alignItems: 'center',
      width: '100%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.primary,
    },
    modalText: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '300',
      color: colors.text,
      marginTop: "5%",
    },
  });
  
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill}/>
      <View style={styles.modalView}>
        <View style={styles.contentContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

export default CustomInfoAlert;