import React from "react";
import { View } from "react-native";
// Assuming this context provides the current theme object (lightTheme or darkTheme)
import { useTheme } from "../contexts/ThemeContext"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * A themed container view that optionally applies safe area insets.
 * @param {object} props 
 * @param {boolean} [props.safe=false] - If true, applies top and bottom safe area padding.
 * @param {object} props.style - Custom styles to merge.
 * @returns {JSX.Element}
 */
export default function ThemedView({ style, safe = false, ...props }) {
  const { theme } = useTheme();
  
  // Use insets only if the 'safe' prop is explicitly set to true
  const insets = safe ? useSafeAreaInsets() : null;

  // Define the base styles, combining theme background and optional safe area padding
  const baseStyle = [
    { 
      // Always apply the theme background color
      backgroundColor: theme.background 
    },
    // Conditionally apply safe area padding if 'insets' exists
    insets && {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      // You can also add left and right here if needed
      // paddingLeft: insets.left,
      // paddingRight: insets.right,
    },
    style // Apply any custom styles passed in via props last (for overrides)
  ];

  return (
    <View 
      style={baseStyle} 
      {...props} 
    />
  );
}