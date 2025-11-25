import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Animated,
  TouchableOpacity,
  ImageBackground,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";

import ThemedText from "../components/ThemedText";
import Spacer from "../components/Spacer";

const BACKGROUND_IMAGE = require("../assets/img/logo.jpg");

export default function Landing() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Safely extract theme colors
  const backgroundColor =
    typeof theme.background === "string" ? theme.background : "#FFFFFF";
  const textColor = typeof theme.text === "string" ? theme.text : "#111111";
  const buttonColor =
    typeof theme.primary === "string" ? theme.primary : "#4B7BEC";

  // Define the opacity for the color overlay (0.0 to 1.0)
  // Higher opacity means the background image is more faded.
  const OVERLAY_OPACITY = 0.6;

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.imageBackground}
      resizeMode="cover"
    >
      {/* Color Overlay View: This covers the image and uses the theme color
                with defined opacity to ensure the text is readable in both light/dark modes. */}
      <View
        style={[
          styles.overlay,
          { backgroundColor: backgroundColor, opacity: OVERLAY_OPACITY },
        ]}
      />

      {/* Animated Container for Text and Buttons (Content Layer) */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* The problematic comments have been removed/corrected. 
                  We're keeping the spacer for layout.
                */}
        <Spacer height={100} />

        <ThemedText style={[styles.title, { color: textColor }]}>
          My Daily Journal
        </ThemedText>
        <Spacer height={10} />
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          Capture your thoughts, reflect and grow.
        </ThemedText>
        <Spacer height={20} />
        <ThemedText style={[styles.tagline, { color: textColor }]}>
          Start your journey today ✨
        </ThemedText>
        <Spacer height={30} />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate("Login")}
        >
          <ThemedText style={styles.buttonText}>Sign In</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate("Signup")}
        >
          <ThemedText style={styles.buttonText}>Register</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    // Stretches across the entire screen
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    // Ensure the content sits on top of the overlay
    zIndex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.8,
    marginTop: 5,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    fontStyle: "italic",
  },
  button: {
    width: "70%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
