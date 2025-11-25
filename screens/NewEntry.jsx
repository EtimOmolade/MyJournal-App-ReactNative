import React, { useState } from "react";
import { 
  Alert, 
  StyleSheet, 
  ScrollView, 
  TouchableWithoutFeedback, 
  Keyboard, 
  ActivityIndicator,
  View,
  TouchableOpacity, 
  FlatList 
} from "react-native";

import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import ThemedTextInput from "../components/ThemedTextInput";

import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

// Mood options
const MOOD_OPTIONS = [
  { mood: 'Great', icon: '😁' },
  { mood: 'Good', icon: '😊' },
  { mood: 'Angry', icon: '😡' },
  { mood: 'Neutral', icon: '😐' },
  { mood: 'Stressed', icon: '😥' },
  { mood: 'Bad', icon: '😔' },
];

export default function NewEntry() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [currentMood, setCurrentMood] = useState(null);
  const [currentActivity, setCurrentActivity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();

  const saveEntry = async () => {
    if (!content.trim()) {
      Alert.alert("Validation Error", "The journal entry content cannot be empty.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("journal_entries")
      .insert([
        { 
          user_id: user.id, // REQUIRED for Supabase RLS
          title: title.trim() || "Untitled Entry",
          content: content.trim(),
          mood: currentMood,
          activity: currentActivity.trim() || null,
        }
      ]);

    setIsLoading(false);

    if (error) {
      console.error("Supabase Error:", error.message);
      Alert.alert("Saving Error", `Failed to save entry: ${error.message}`);
    } else {
      Alert.alert("Success", "Journal entry saved successfully!");
      
      // Reset form
      setTitle("");
      setContent("");
      setCurrentMood(null);
      setCurrentActivity("");

      // Navigate to All Entries tab inside MainTabs
      navigation.navigate("Main", {
        screen: "AllEntriesTab",
      });
    }
  };

  // Mood Renderer
  const renderMoodItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.moodItem,
        currentMood === item.mood && { 
backgroundColor: theme.uiBackground,
          borderColor: "#4B7BEC" 
        }
      ]}
      onPress={() => setCurrentMood(item.mood)}
    >
      <ThemedText style={styles.moodIcon}>{item.icon}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView safe style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          <ThemedText style={styles.headerTitle}>Today's Tale</ThemedText>

          {/* Title */}
          <ThemedTextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            maxLength={100}
          />

          {/* Mood Selector */}
          <ThemedText style={styles.label}>How are you feeling?</ThemedText>

          <FlatList
            horizontal
            data={MOOD_OPTIONS}
            renderItem={renderMoodItem}
            keyExtractor={(item) => item.mood}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodList}
          />

          {/* Activity */}
          <ThemedText style={styles.label}>Current Activity</ThemedText>

          <ThemedTextInput
            placeholder="What are you doing now?"
            value={currentActivity}
            onChangeText={setCurrentActivity}
            style={styles.activityInput}
            maxLength={100}
          />

          {/* Content */}
          <ThemedTextInput
            placeholder="Write your thoughts here..."
            value={content}
            onChangeText={setContent}
            multiline
            style={styles.contentInput}
            textAlignVertical="top"
          />

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <ThemedText
              onPress={isLoading ? null : saveEntry}
              style={[
                styles.button,
                { backgroundColor: "#4B7BEC" },
                isLoading && styles.buttonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                "Save Entry"
              )}
            </ThemedText>
          </View>

        </ScrollView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    marginBottom: 20, 
    textAlign: "center",
  },
  titleInput: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "600",
    height: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  moodList: {
    paddingVertical: 5,
    marginBottom: 20,
  },
  moodItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodIcon: {
    fontSize: 30,
  },
  activityInput: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    height: 50,
  },
  contentInput: {
    padding: 15,
    borderRadius: 8,
    height: 250,
    marginBottom: 30,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    padding: 15,
    borderRadius: 12,
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
