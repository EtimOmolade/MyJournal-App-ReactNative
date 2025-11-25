import React, { useState } from "react";
import { 
    Alert, 
    Keyboard, 
    TouchableWithoutFeedback, 
    // 👇 NEW IMPORTS NEEDED
    View, 
    TouchableOpacity, 
    StyleSheet 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 👈 NEW IMPORT
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import ThemedTextInput from "../components/ThemedTextInput";
import { useAuth } from "../contexts/AuthContext";
import Spacer from "../components/Spacer";

export default function Login({ navigation }) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // 1. State for toggling password visibility
    const [showPassword, setShowPassword] = useState(false); 

    const handleLogin = async () => {
        try {
            await signIn(email, password);
        } catch (error) {
            Alert.alert("Login Error", error.message);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.title}>
                    Login
                </ThemedText>

                <ThemedTextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                />
                
                {/* 3. Password Input Container */}
                <View style={styles.passwordContainer}>
                    <ThemedTextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        // 2. Use the state to toggle secureTextEntry
                        secureTextEntry={!showPassword} 
                        style={styles.passwordInput}
                    />
                    
                    {/* 4. Eye Icon Button */}
                    <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)} 
                        style={styles.eyeIcon}
                    >
                        <Ionicons 
                            // 5. Change icon based on state
                            name={showPassword ? "eye" : "eye-off"} 
                            size={24} 
                            // Assuming your theme has a standard text color
                            color="#999" 
                        />
                    </TouchableOpacity>
                </View>

                <ThemedText
                    onPress={handleLogin}
                    style={styles.loginButton}
                >
                    Login
                </ThemedText>

                <Spacer />

                <ThemedText
                    onPress={() => navigation.navigate("Signup")}
                    style={styles.registerLink}
                >
                    Don't have an account? Register
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
    textInput: { 
        marginBottom: 12 
    },
    // 6. Style for wrapping View (Password Input Container)
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    // 7. Style for ThemedTextInput inside the container
    passwordInput: {
        flex: 1, // Allow input to take up most of the space
        // Remove the separate bottom margin from the input itself
        marginBottom: 0, 
    },
    // 8. Style for the absolute positioned icon
    eyeIcon: {
        position: 'absolute',
        right: 15, // Position it slightly inside the input box
        padding: 5, // Make the tap area easier
        zIndex: 10,
    },
    loginButton: {
        backgroundColor: "#4B7BEC",
        color: "white",
        padding: 15,
        borderRadius: 10,
        textAlign: "center",
    },
    registerLink: { 
        marginTop: 20, 
        textAlign: "center", 
        color: "#4B7BEC" 
    },
});