import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import ThemedText from "../components/ThemedText";
import ThemedView from "../components/ThemedView";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function Logout({ navigation }) {
  const { signOut } = useAuth();
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[theme.background, theme.inputBackground]}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <View style={styles.card}>
          <ThemedText style={styles.title}>Logout</ThemedText>
          <ThemedText style={styles.subtitle}>
            Are you sure you want to log out?
          </ThemedText>

          <View style={styles.buttons}>
            {/* Cancel */}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.primary }]}
              onPress={() => navigation.goBack()}
            >
              <ThemedText style={[styles.cancelText, { color: theme.primary }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>

            {/* Confirm Logout */}
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: theme.primary }]}
              onPress={signOut}
            >
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  card: {
    padding: 25,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: "#ffffff15",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 25,
  },

  buttons: {
    width: "100%",
  },

  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },

  cancelText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  logoutButton: {
    paddingVertical: 12,
    borderRadius: 12,
  },

  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
