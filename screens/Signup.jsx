import React, { useState } from "react";
import { 
    Alert, 
    TouchableWithoutFeedback, 
    Keyboard, 
    // 👇 NEW IMPORTS NEEDED
    View, 
    TouchableOpacity, 
    StyleSheet 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 👈 NEW IMPORT

import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import ThemedTextInput from "../components/ThemedTextInput";
import Spacer from "../components/Spacer";
import { useAuth } from "../contexts/AuthContext";
// Added useTheme context to use theme colors for the icon
import { useTheme } from "../contexts/ThemeContext"; 

export default function Signup({ navigation }) {
    const { signUp } = useAuth();
    const { theme } = useTheme(); // Use theme for icon color
    
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // 1. State for toggling password visibility
    const [showPassword, setShowPassword] = useState(false); 

    const handleSignup = async () => {
        // Basic validation to ensure all fields are filled
        if (!displayName || !email || !password) {
            Alert.alert("Error", "Please fill in your name, email, and password.");
            return;
        }

        try {
            await signUp(email, password, displayName);
            Alert.alert("Success", "Account created! Please login.");
            navigation.navigate("Login");
        } catch (error) {
            Alert.alert("Signup Error", error.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.title}>
                    Register
                </ThemedText>

                <ThemedTextInput
                    placeholder="Name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    style={styles.textInput}
                    autoCapitalize="words"
                />

                <ThemedTextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.textInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                
                {/* START: Password Input with Toggle */}
                <View style={styles.passwordContainer}>
                    <ThemedTextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        // 2. Use the state to toggle secureTextEntry
                        secureTextEntry={!showPassword} 
                        style={styles.passwordInput}
                    />
                    
                    {/* 3. Eye Icon Button */}
                    <TouchableOpacity 
                        onPress={togglePasswordVisibility} 
                        style={styles.eyeIcon}
                    >
                        <Ionicons 
                            // 4. Change icon based on state
                            name={showPassword ? "eye" : "eye-off"} 
                            size={24} 
                            color={theme.text} // Use theme text color for icon
                        />
                    </TouchableOpacity>
                </View>
                {/* END: Password Input with Toggle */}

                <ThemedText
                    onPress={handleSignup}
                    style={styles.registerButton}
                >
                    Register
                </ThemedText>

                <Spacer />

                <ThemedText
                    onPress={() => navigation.navigate("Login")}
                    style={styles.loginLink}
                >
                    Already have an account? Login
                </ThemedText>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: "center" 
    },
    title: { 
        fontSize: 28, 
        marginBottom: 20, 
        textAlign: "center" 
    },
    // ThemedTextInput styles used throughout
    textInput: { 
        marginBottom: 12 
    },
    
    // --- Password Toggle Styles ---
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // Set the margin for the whole container
        marginBottom: 20, 
    },
    passwordInput: {
        flex: 1, 
        // Remove individual input bottom margin since the container handles it
        marginBottom: 0, 
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        padding: 5,
        zIndex: 10,
    },
    
    // --- Button/Link Styles ---
    registerButton: {
        backgroundColor: "#4B7BEC",
        color: "white",
        padding: 15,
        borderRadius: 10,
        textAlign: "center",
        fontWeight: '600',
    },
    loginLink: { 
        marginTop: 20, 
        textAlign: "center", 
        color: "#4B7BEC" 
    },
});