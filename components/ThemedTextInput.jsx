import React from "react";
import { TextInput } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemedTextInput({ style, ...props }) {
  const { theme } = useTheme();
  
  // Define the actual color for the input text based on the general text color
  const inputTextColor = theme.text; 

  return (
    <TextInput
      // Set placeholder color based on theme.text with reduced opacity
      placeholderTextColor={theme.text + "88"} 
      style={[
        {
          backgroundColor: theme.inputBackground,
          // CRITICAL FIX: Use the calculated text color for visibility
          color: inputTextColor, 
          padding: 12,
          borderRadius: 8,
          fontSize: 16, // Added standard font size for better usability
        },
        style,
      ]}
      {...props}
    />
  );
}