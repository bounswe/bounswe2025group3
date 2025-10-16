import React, { useRef } from "react";
import { GestureResponderEvent, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface SafeTouchableOpacityProps extends TouchableOpacityProps {
  onPress?: (event: GestureResponderEvent) => void;
  delay?: number;
}

export default function SafeTouchableOpacity({
  onPress,
  delay = 800,
  ...props
}: SafeTouchableOpacityProps) {
  const lastPress = useRef(0);

  const handlePress = (event: GestureResponderEvent) => {
    const now = Date.now();
    if (now - lastPress.current < delay) return;
    lastPress.current = now;
    onPress?.(event);
  };

  return <TouchableOpacity {...props} onPress={handlePress} />;
}
