import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native';

interface PillButtonProps {
  text: string;
  onPress?: () => void; 
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  disabled?: boolean;
}

const PillButton: React.FC<PillButtonProps> = ({
  text,
  onPress,
  backgroundColor = 'white',
  borderColor = 'black',
  textColor = 'black',
  disabled = false,
}) => {

  const dynamicContainerStyle: ViewStyle = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
  };

  const dynamicTextStyle: TextStyle = {
    color: textColor,
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[styles.container, dynamicContainerStyle]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, dynamicTextStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PillButton;