import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import ThemedText from "../components/ThemedText";
import ThemedView from "../components/ThemedView";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";

export default function EditProfile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // State for Display Name
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || ""
  );
  const [loadingDisplayName, setLoadingDisplayName] = useState(false);

  // State for Password Change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // --- FUNCTION TO HANDLE DISPLAY NAME UPDATE ---
  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name cannot be empty.");
      return;
    }

    setLoadingDisplayName(true);

    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim() },
    });

    setLoadingDisplayName(false);

    if (error) {
      Alert.alert("Update Failed", error.message);
      console.error(error);
    } else {
      Alert.alert("Success", "Your display name has been updated!");
    }
  };

  // --- FUNCTION TO HANDLE PASSWORD CHANGE ---
  const handleChangePassword = async () => {
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoadingPassword(true);

    // Supabase function to update user password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoadingPassword(false);

    if (error) {
      // Note: Supabase will usually invalidate the current session after a password change,
      // sometimes requiring re-login. The error message will guide the user.
      Alert.alert("Password Update Failed", error.message);
      console.error(error);
    } else {
      Alert.alert(
        "Success",
        "Password updated successfully. You may need to log in again."
      );
      // Clear inputs after success
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const commonInputProps = {
    style: [
      styles.input,
      {
        borderColor: theme.inputBorder,
        backgroundColor: theme.inputBackground,
        color: theme.text,
      },
    ],
    placeholderTextColor: theme.text + "80",
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ThemedView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ThemedText style={styles.header}>Update Profile</ThemedText>

        {/* Display Name Section */}
        <ThemedText style={[styles.label, { color: theme.text }]}>
          Display Name
        </ThemedText>
        <TextInput
          {...commonInputProps}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your new name"
          autoCapitalize="words"
        />
        <ThemedText style={[styles.hint, { color: theme.text + "80" }]}>
          This name will appear on your profile.
        </ThemedText>

        {/* Save Display Name Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleUpdateProfile}
          disabled={loadingDisplayName}
        >
          {loadingDisplayName ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.saveButtonText}>
              Save Display Name
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* --- Change Password Section --- */}
        <View style={styles.sectionDivider} />

        <ThemedText style={[styles.label, { color: theme.text }]}>
          Change Password
        </ThemedText>

        <TextInput
          {...commonInputProps}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password (min 6 characters)"
          secureTextEntry={true}
          
        />

        <TextInput
          {...commonInputProps}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry={true}
        />

        <ThemedText style={[styles.hint, { color: theme.text + "80" }]}>
          You may be logged out after changing your password.
        </ThemedText>

        {/* Change Password Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleChangePassword}
          disabled={loadingPassword}
        >
          {loadingPassword ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.saveButtonText}>
              Update Password
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  hint: {
    fontSize: 12,
    marginBottom: 30,
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10, // Reduced margin since we added a divider
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  // --- NEW STYLE FOR VISUAL SEPARATION ---
  sectionDivider: {
    height: 1,
    backgroundColor: "#ccc", // Use a light gray color
    marginVertical: 30, // Space above and below the line
  },
});
