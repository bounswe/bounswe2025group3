import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  View
} from 'react-native';
import { useColors } from '@/constants/colors';

interface MultipleChoiceModalProps {
  visible: boolean;
  options: string[];
  onClose: () => void;
  onSelect: (option: string) => void;
  title: string;
  selectedOption?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MultipleChoiceModal: React.FC<MultipleChoiceModalProps> = ({
  visible,
  options,
  onClose,
  onSelect,
  title,
  selectedOption,
}) => {
  const colors = useColors();
  const [currentSelection, setCurrentSelection] = useState(selectedOption || '');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      slideAnim.setValue(SCREEN_HEIGHT);
      overlayAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0.4,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => setIsMounted(false));
    }
  }, [visible]);

  if (!isMounted) return null;

  const styles = StyleSheet.create({
    overlay: { position: 'absolute', alignItems: 'center', top: 0, left: 0, right: 0, bottom: 0 }, 
    modalView: { position: 'absolute', bottom: "7%", width: '95%', backgroundColor: colors.background, borderRadius: 8, padding: 12 }, 
    modalTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: colors.textSecondary, marginLeft: 4 }, 
    optionText: { fontSize: 16, fontWeight: 500, color: colors.text }, 
    optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, marginBottom: 4 }, 
    radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }, 
    radioCircleSelected: { borderColor: colors.primary }, 
    radioInnerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }
  });

  const handleSelect = (option: string) => {
    setCurrentSelection(option);
    onSelect(option);
    onClose();
  };

  return (
    <Animated.View style={[styles.overlay, { backgroundColor: overlayAnim.interpolate({
      inputRange: [0, 0.4],
      outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']
    }) }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          styles.modalView,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.modalTitle}>{title}</Text>
        <View style={{ height: 1, backgroundColor: colors.borders, marginBottom: 8 }} />

        {options.map((option) => (
        <TouchableOpacity
            key={option}
            style={styles.optionButton}
            onPress={() => handleSelect(option)}
        >
            <View style={[
            styles.radioCircle,
            currentSelection === option && styles.radioCircleSelected
            ]}>
            {currentSelection === option && <View style={styles.radioInnerCircle} />}
            </View>

            <Text style={styles.optionText}>
            {option}
            </Text>
        </TouchableOpacity>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

export default MultipleChoiceModal;
