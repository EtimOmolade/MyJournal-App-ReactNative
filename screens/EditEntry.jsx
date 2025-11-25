import React, { useState } from "react";
import { Alert, StyleSheet, ScrollView, FlatList, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from "react-native";
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import ThemedTextInput from "../components/ThemedTextInput";
import { supabase } from "../lib/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mood options
const MOOD_OPTIONS = [
  { mood: "Great", icon: "😁" },
  { mood: "Good", icon: "😊" },
  { mood: "Neutral", icon: "😐" },
  { mood: "Stressed", icon: "😥" },
  { mood: "Bad", icon: "😔" },
  { mood: "Angry", icon: "😡" },
];

export default function EditEntry() {
  const navigation = useNavigation();
  const route = useRoute();
  const { entry } = route.params;

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState(entry.title || "");
  const [content, setContent] = useState(entry.content);
  const [currentMood, setCurrentMood] = useState(entry.mood || null);
  const [activity, setActivity] = useState(entry.activity || "");
  const [isLoading, setIsLoading] = useState(false);

  const updateEntry = async () => {
    if (!content.trim()) {
      Alert.alert("Validation Error", "Entry content cannot be empty.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("journal_entries")
      .update({
        title: title.trim() || "Untitled Entry",
        content: content.trim(),
        mood: currentMood,
        activity: activity.trim() || null,
      })
      .eq("id", entry.id);

    setIsLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Journal entry updated!");
      navigation.goBack();
    }
  };

  const renderMoodItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.moodItem,
        currentMood === item.mood && { borderColor: "#4B7BEC", borderWidth: 2 },
      ]}
      onPress={() => setCurrentMood(item.mood)}
    >
      <ThemedText style={styles.moodIcon}>{item.icon}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ThemedView
        safe
        style={[
          styles.container,
          {
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <ThemedText style={styles.header}>Edit Entry</ThemedText>

          {/* Title Input */}
          <ThemedTextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            maxLength={100}
          />

          {/* Mood Selector */}
          <ThemedText style={styles.label}>Mood</ThemedText>
          <FlatList
            horizontal
            data={MOOD_OPTIONS}
            renderItem={renderMoodItem}
            keyExtractor={(item) => item.mood}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 5, marginBottom: 15 }}
          />

          {/* Activity Input */}
          <ThemedText style={styles.label}>Current Activity</ThemedText>
          <ThemedTextInput
            placeholder="What are you doing now?"
            value={activity}
            onChangeText={setActivity}
            style={styles.activityInput}
            maxLength={100}
          />

          {/* Content Input */}
          <ThemedTextInput
            placeholder="Edit your thoughts..."
            value={content}
            onChangeText={setContent}
            multiline
            style={styles.contentInput}
            textAlignVertical="top"
          />

          {/* Save Button */}
          <ThemedText
            onPress={isLoading ? null : updateEntry}
            style={[
              styles.button,
              { backgroundColor: "#4B7BEC" },
              isLoading && { opacity: 0.6 },
            ]}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </ThemedText>
        </ScrollView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: "700", marginBottom: 20, textAlign: "center", },
  titleInput: {
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    height: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
  },
  moodItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  moodIcon: { fontSize: 28 },
  activityInput: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    height: 50,
  },
  contentInput: {
    padding: 15,
    borderRadius: 12,
    height: 250,
    marginBottom: 25,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 25,
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
