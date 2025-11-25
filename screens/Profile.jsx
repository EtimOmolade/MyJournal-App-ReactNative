import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "../components/ThemedText";
import ThemedView from "../components/ThemedView";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const EDIT_PROFILE_SCREEN = "EditProfile";
const NEW_ENTRY_SCREEN = "NewEntry";

export default function ProfileDashboard() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const displayName = user?.user_metadata?.display_name || user?.email;

  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastEntryDate, setLastEntryDate] = useState("-");
  const [quote, setQuote] = useState("");
  const [today, setToday] = useState("");

  const quotes = [
    "Write what your heart whispers.",
    "Your story matters — keep writing.",
    "One entry a day keeps your mind clear.",
    "Small words create big healing.",
    "Let your thoughts flow freely today.",
  ];

  const isDarkMode = theme.background === "#000000";

  // --- CALCULATE REAL JOURNAL STREAK ---
  const calculateStreak = (entries) => {
    if (!entries.length) return 0;

    // Convert to dates only (no time)
    const entryDates = [
      ...new Set(
        entries.map((e) =>
          new Date(e.created_at).toISOString().split("T")[0]
        )
      ),
    ].sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    let cursor = new Date(); // today

    for (let date of entryDates) {
      const cursorStr = cursor.toISOString().split("T")[0];

      if (date === cursorStr) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1); // move to yesterday
      } else break;
    }

    return currentStreak;
  };

  // --- FETCH ENTRIES ---
  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return;

    setEntries(data);

    if (data.length > 0) {
      setLastEntryDate(new Date(data[0].created_at).toDateString());
      setStreak(calculateStreak(data));
    }
  };

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setToday(new Date().toDateString());

    fetchEntries();

    const subscription = supabase
      .channel("public:journal_entries")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "journal_entries" },
        fetchEntries
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient
        colors={[theme.background, theme.inputBackground]}
        style={{ flex: 1 }}
      >
        <ThemedView
          safe
          style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {/* --- TOP BAR --- */}
            <View style={styles.topBar}>
              <ThemedText style={[styles.topBarText, { color: theme.text }]}>
                Profile
              </ThemedText>

              <TouchableOpacity onPress={toggleTheme} style={styles.themeToggleIcon}>
                <Ionicons
                  name={isDarkMode ? "sunny-sharp" : "moon-sharp"}
                  size={35}
                  color={isDarkMode ? "#FFD700" : "#cc590dff"}
                />
              </TouchableOpacity>
            </View>

            {/* --- PROFILE CARD --- */}
            <View
              style={[
                styles.profileCard,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.primary + "50" },
                ]}
              >
                <ThemedText style={{ fontSize: 32, color: theme.primary }}>
                  {displayName[0]?.toUpperCase()}
                </ThemedText>
              </View>

              <ThemedText style={[styles.profileName, { color: theme.text }]}>
                {displayName}
              </ThemedText>

              <ThemedText
                style={[styles.emailText, { color: theme.text, opacity: 0.7 }]}
              >
                {user?.email}
              </ThemedText>

              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate(EDIT_PROFILE_SCREEN)}
              >
                <ThemedText style={styles.editButtonText}>Update Profile</ThemedText>
              </TouchableOpacity>
            </View>

            {/* --- QUOTE CARD --- */}
            <View style={[styles.card, { backgroundColor: theme.uiBackground }]}>
              <ThemedText style={styles.quoteLarge}>"{quote}"</ThemedText>
              <ThemedText style={styles.date}>{today}</ThemedText>
            </View>

            {/* --- STATS CARD --- */}
            <View style={[styles.statsCard, { backgroundColor: theme.uiBackground }]}>
              <ThemedText style={styles.statsTitle}>My Stats</ThemedText>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>{entries.length}</ThemedText>
                  <ThemedText style={styles.statLabel}>Entries</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>{streak}</ThemedText>
                  <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabelDate}>
                    {lastEntryDate}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Last Entry</ThemedText>
                </View>
              </View>
            </View>

            {/* --- NEW ENTRY BUTTON --- */}
            <TouchableOpacity
              style={[styles.newEntryButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate(NEW_ENTRY_SCREEN)}
            >
              <ThemedText style={styles.buttonText}>New Entry</ThemedText>
            </TouchableOpacity>

            {/* --- LOGOUT BUTTON --- */}
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: "#D9534F" }]}
              onPress={signOut}
            >
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    alignItems: "center",
  },
  topBarText: {
    fontSize: 22,
    fontWeight: "700",
  },
  themeToggleIcon: {
    padding: 5,
  },
  profileCard: {
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
  },
  editButtonText: { color: "#fff", fontWeight: "700" },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  quoteLarge: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 10,
  },
  date: { fontSize: 14, opacity: 0.7, textAlign: "center" },
  statsCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 14, opacity: 0.7 },
  statLabelDate: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  newEntryButton: {
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  logoutButton: {
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
