import { useColors } from '@/constants/colors';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface CustomAlertProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
}

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 9999,
    },
    modalView: {
      backgroundColor: 'white',
      borderRadius: 8,
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
      paddingBottom: 20,
      alignItems: 'center',
      width: '100%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: 'black',
    },
    modalText: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '300',
      color: 'black',
    },
    actionsContainer: {
      flexDirection: 'row',
      width: '100%',
      borderTopWidth: 1,
      borderTopColor: '#EFEFEF',
    },
    actionButton: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftActionButton: {
      borderRightWidth: 1,
      borderRightColor: '#EFEFEF',
    },
    textStyleCancel: {
      color: 'black',
      fontSize: 16,
      fontWeight: '500',
    },
    textStyleConfirm: {
      fontSize: 16,
      fontWeight: '500',
    },
  });

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
}) => {
  const colors = useColors();
  const { t } = useTranslation();
  
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} />

      <View style={styles.modalView}>
        <View style={styles.contentContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.leftActionButton]}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={styles.textStyleCancel}>{t('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onConfirm}
            activeOpacity={0.7}>
            <Text style={[styles.textStyleConfirm, { color: colors.error }]}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CustomAlert;