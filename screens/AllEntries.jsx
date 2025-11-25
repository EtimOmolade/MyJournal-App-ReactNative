import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  View,
  ActivityIndicator,
  TextInput,
  Text,
  Platform,
} from "react-native";
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import { supabase } from "../lib/supabase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons"; 

// ---------- Constants (UNCHANGED) ----------
const PAGE_SIZE = 10;

const MOOD_EMOJIS = {
  Great: "😁",
  Good: "😊",
  Angry: "😡",
  Neutral: "😐",
  Stressed: "😥",
  Bad: "😔",
};

const MOOD_COLORS = {
  Great: "#4CAF50",
  Good: "#8BC34A",
  Neutral: "#FFC107",
  Stressed: "#FF9800",
  Bad: "#F44336",
  Angry: "#B71C1C",
};

const DATE_RANGES = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

export default function AllEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters & UI state
  const [filters, setFilters] = useState({
    mood: null,
    activity: null,
    dateRange: "all",
    sort: "desc", 
    search: "",
  });

  // 👇 NEW STATE: Controls the visibility of the FilterBar content
  const [showFilters, setShowFilters] = useState(false); 

  const [activities, setActivities] = useState([]); 
  const [filterMenuOpen, setFilterMenuOpen] = useState(false); 

  const searchTimeout = useRef(null);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // ---------- Helper: buildQuery (UNCHANGED) ----------
  const buildQuery = () => {
    let query = supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: filters.sort === "asc" });

    if (filters.mood) query = query.eq("mood", filters.mood);
    if (filters.activity) query = query.eq("activity", filters.activity);

    // Date range filtering: convert to ISO timestamps
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let from;
      if (filters.dateRange === "today") {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight today
      } else if (filters.dateRange === "week") {
        const firstDayOfWeek = new Date(now);
        const day = firstDayOfWeek.getDay(); // 0 (Sun) - 6
        firstDayOfWeek.setDate(now.getDate() - day); // start Sunday
        from = new Date(
          firstDayOfWeek.getFullYear(),
          firstDayOfWeek.getMonth(),
          firstDayOfWeek.getDate()
        );
      } else if (filters.dateRange === "month") {
        from = new Date(now.getFullYear(), now.getMonth(), 1); // first day of month
      }
      if (from) {
        query = query.gte("created_at", from.toISOString());
      }
    }

    // Search across title and content (simple case: use ilike)
    if (filters.search && filters.search.trim().length > 0) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${term},content.ilike.${term}`);
    }

    return query;
  };

  // ---------- Fetch unique activities, Fetch entries, Delete entry (UNCHANGED) ----------
  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("activity")
      .not("activity", "is", null)
      .limit(500); 

    if (error) {
      console.warn("Failed to fetch activities", error);
      return;
    }
    const uniq = Array.from(
      new Set(data.map((r) => r.activity).filter(Boolean))
    ).sort();
    setActivities(uniq);
  };

  const fetchEntries = async (reset = false) => {
    try {
      if (reset) {
        setPage(0);
        setHasMore(true);
      }

      if (reset) setLoading(true);
      else setLoadingMore(true);

      const start = reset ? 0 : page * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = buildQuery().range(start, end);

      const { data, error } = await query;

      if (error) {
        console.error("Fetch entries error:", error);
        Alert.alert("Error", "Failed to fetch entries");
      } else {
        if (reset) setEntries(data || []);
        else
          setEntries((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const newItems = (data || []).filter((d) => !ids.has(d.id));
            return [...prev, ...newItems];
          });

        if (!data || data.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (data && data.length > 0 && !reset) {
          setPage((p) => p + 1);
        } else if (reset && data && data.length > 0) {
          setPage(1);
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while fetching entries");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const deleteEntry = async (id) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("journal_entries")
            .delete()
            .eq("id", id);
          if (error) Alert.alert("Error", "Failed to delete entry");
          else fetchEntries(true);
        },
      },
    ]);
  };
  
  const renderItem = ({ item }) => {
    const moodColor = MOOD_COLORS[item.mood] || theme.primary;

    return (
      <ThemedView
        style={[styles.entryContainer, { backgroundColor: theme.uiBackground }]}
      >
        <ThemedText style={styles.date}>
          {new Date(item.created_at).toDateString()}
        </ThemedText>

        {item.title ? (
          <ThemedText style={styles.titleEntry}>{item.title}</ThemedText>
        ) : null}

        {item.mood && (
          <View style={[styles.moodBadge, { backgroundColor: moodColor + "CC" }]}>
            <ThemedText style={styles.moodText}>
              {MOOD_EMOJIS[item.mood] || ""} {item.mood}
            </ThemedText>
          </View>
        )}

        {item.activity ? (
          <ThemedText style={styles.activityText}>
            Activity: {item.activity}
          </ThemedText>
        ) : null}

        <ThemedText style={styles.content}>{item.content}</ThemedText>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate("EditEntry", { entry: item })}
          >
            <ThemedText style={styles.buttonText}>Edit</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#ff3b30" }]}
            onPress={() => deleteEntry(item.id)}
          >
            <ThemedText style={styles.buttonText}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };
  
  // ---------- Effects & focus, Load more handler, List empty component (UNCHANGED) ----------
  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    fetchEntries(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort, filters.mood, filters.activity, filters.dateRange, filters.search]);

  useFocusEffect(
    useCallback(() => {
      fetchEntries(true);
    }, [])
  );

  const onSearchChange = (text) => {
    setFilters((f) => ({ ...f, search: text }));

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: text }));
    }, 400); 
  };
  
  const handleLoadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    fetchEntries(false);
  };

  const ListEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={{ padding: 30, alignItems: "center" }}>
        <ThemedText>No entries found — try changing filters.</ThemedText>
      </View>
    );
  };

  // ---------- UI: Filter bar (MODIFIED) ----------
  const FilterBar = () => {
    // Helper to get selected date range label
    const dateLabel =
      DATE_RANGES.find((d) => d.key === filters.dateRange)?.label || "Date";

    // Helper for control button icons/text
    const sortIcon = filters.sort === "asc" ? "arrow-up" : "arrow-down";
    const sortLabel = filters.sort === "desc" ? "Newest" : "Oldest";

    // 🛑 KEY CHANGE: Only render the complex filtering UI if showFilters is true
    if (!showFilters) {
        // Return null or a simple empty view if the filters are hidden
        return null;
    }

    return (
      <View style={styles.filterBar}>
        {/* Search Input with Icon and Clear Button */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.inputBackground,
              flexDirection: "row",
              alignItems: "center",
            },
          ]}
        >
          <Feather name="search" size={16} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search title or content..."
            placeholderTextColor="#888"
            value={filters.search} 
            onChangeText={onSearchChange} 
            
            style={[styles.searchInput, { color: theme.text, flex: 1 }]}
            returnKeyType="search"
            clearButtonMode="while-editing" 
          />
          {/* Manual Clear Button for non-iOS consistency */}
          {filters.search.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity
              onPress={() => setFilters((f) => ({ ...f, search: "" }))}
              style={{ marginLeft: 8 }}
            >
              <Feather name="x-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Mood chips (Styled to use MOOD_COLORS when active) */}
        <View style={styles.moodRow}>
          <FlatList
            horizontal
            data={Object.keys(MOOD_EMOJIS)}
            keyExtractor={(m) => m}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item: m }) => {
              const active = filters.mood === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      mood: prev.mood === m ? null : m,
                    }))
                  }
                  style={[
                    styles.moodChip,
                    {
                      backgroundColor: active ? MOOD_COLORS[m] : theme.uiBackground,
                      borderColor: active ? MOOD_COLORS[m] : theme.borderColor,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: active ? "#fff" : theme.text,
                      fontWeight: "700",
                    }}
                  >
                    {MOOD_EMOJIS[m]} {m}
                  </ThemedText>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Dynamic Controls row */}
        <View style={styles.controlsRow}>
          {/* Date range */}
          {(() => {
            const active = filters.dateRange !== "all";
            return (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  {
                    backgroundColor: active ? theme.primary : theme.uiBackground,
                    borderColor: active ? theme.primary : theme.borderColor,
                  },
                ]}
                onPress={() =>
                  setFilterMenuOpen((open) => (open === "date" ? false : "date"))
                }
              >
                <ThemedText
                  style={{ color: active ? "white" : theme.text, fontSize: 13 }}
                >
                  {dateLabel}
                </ThemedText>
              </TouchableOpacity>
            );
          })()}

          {/* Activity */}
          {(() => {
            const active = !!filters.activity;
            return (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  {
                    backgroundColor: active ? theme.primary : theme.uiBackground,
                    borderColor: active ? theme.primary : theme.borderColor,
                  },
                ]}
                onPress={() =>
                  setFilterMenuOpen((open) =>
                    open === "activity" ? false : "activity"
                  )
                }
              >
                <ThemedText
                  style={{ color: active ? "white" : theme.text, fontSize: 13 }}
                >
                  {filters.activity ? filters.activity : "Activity"}
                </ThemedText>
              </TouchableOpacity>
            );
          })()}

          {/* Sort */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: theme.uiBackground, borderColor: theme.borderColor },
            ]}
            onPress={() => setFilterMenuOpen((open) => (open === "sort" ? false : "sort"))}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name={sortIcon} size={14} color={theme.text} style={{ marginRight: 4 }} />
              <ThemedText style={{ fontSize: 13 }}>{sortLabel}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Filter menus (Improved Popups) */}
        {filterMenuOpen === "date" && (
          <View style={[styles.menuPopup, { backgroundColor: theme.uiBackground, borderColor: theme.borderColor }]}>
            {DATE_RANGES.map((d) => {
              const isSelected = filters.dateRange === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => {
                    setFilters((prev) => ({ ...prev, dateRange: d.key }));
                    setFilterMenuOpen(false);
                  }}
                  style={[styles.menuItem, isSelected && { backgroundColor: theme.primary + "10" }]}
                >
                  <View style={styles.menuItemContent}>
                    <ThemedText style={{ fontWeight: isSelected ? "700" : "400" }}>
                      {d.label}
                    </ThemedText>
                    {isSelected && <Feather name="check" size={18} color={theme.primary} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {filterMenuOpen === "activity" && (
          <View style={[styles.menuPopup, { backgroundColor: theme.uiBackground, borderColor: theme.borderColor }]}>
            {/* Reset option */}
            <TouchableOpacity
              onPress={() => {
                setFilters((prev) => ({ ...prev, activity: null }));
                setFilterMenuOpen(false);
              }}
              style={[
                styles.menuItem,
                !filters.activity && { backgroundColor: theme.primary + "10" },
              ]}
            >
              <View style={styles.menuItemContent}>
                <ThemedText style={{ fontWeight: filters.activity ? "400" : "700" }}>
                  Any activity
                </ThemedText>
                {!filters.activity && <Feather name="check" size={18} color={theme.primary} />}
              </View>
            </TouchableOpacity>

            {activities.length === 0 ? (
              <View style={{ padding: 12 }}>
                <ThemedText style={{ opacity: 0.6 }}>No activities found</ThemedText>
              </View>
            ) : (
              activities.map((a) => {
                const isSelected = filters.activity === a;
                return (
                  <TouchableOpacity
                    key={a}
                    onPress={() => {
                      setFilters((prev) => ({ ...prev, activity: a }));
                      setFilterMenuOpen(false);
                    }}
                    style={[styles.menuItem, isSelected && { backgroundColor: theme.primary + "10" }]}
                  >
                    <View style={styles.menuItemContent}>
                      <ThemedText style={{ fontWeight: isSelected ? "700" : "400" }}>
                        {a}
                      </ThemedText>
                      {isSelected && <Feather name="check" size={18} color={theme.primary} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {filterMenuOpen === "sort" && (
          <View style={[styles.menuPopup, { backgroundColor: theme.uiBackground, borderColor: theme.borderColor }]}>
            {/* Newest first */}
            <TouchableOpacity
              onPress={() => {
                setFilters((prev) => ({ ...prev, sort: "desc" }));
                setFilterMenuOpen(false);
              }}
              style={[styles.menuItem, filters.sort === "desc" && { backgroundColor: theme.primary + "10" }]}
            >
              <View style={styles.menuItemContent}>
                <ThemedText style={{ fontWeight: filters.sort === "desc" ? "700" : "400" }}>
                  Newest first
                </ThemedText>
                {filters.sort === "desc" && <Feather name="check" size={18} color={theme.primary} />}
              </View>
            </TouchableOpacity>
            {/* Oldest first */}
            <TouchableOpacity
              onPress={() => {
                setFilters((prev) => ({ ...prev, sort: "asc" }));
                setFilterMenuOpen(false);
              }}
              style={[styles.menuItem, filters.sort === "asc" && { backgroundColor: theme.primary + "10" }]}
            >
              <View style={styles.menuItemContent}>
                <ThemedText style={{ fontWeight: filters.sort === "asc" ? "700" : "400" }}>
                  Oldest first
                </ThemedText>
                {filters.sort === "asc" && <Feather name="check" size={18} color={theme.primary} />}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ---------- Main render (MODIFIED) ----------
  return (
    <ThemedView
      safe
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 20,
          backgroundColor: theme.background,
        },
      ]}
    >
      {/* Header Row: Title + Filter Toggle Button */}
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>My Thoughts</ThemedText>
        
        <TouchableOpacity
          style={[styles.filterToggle, { borderColor: theme.borderColor }]}
          onPress={() => {
            setShowFilters(prev => !prev);
            // Close any open filter menus when toggling the bar visibility
            if (filterMenuOpen) setFilterMenuOpen(false); 
          }}
        >
          <Feather 
            name={showFilters ? "filter" : "filter"} 
            size={18} 
            color={showFilters ? theme.primary : theme.text} 
            style={{ marginRight: 6 }}
          />
          <ThemedText style={{ color: showFilters ? theme.primary : theme.text, fontWeight: '600' }}>
            {showFilters ? "Hide Filters" : "Filter"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <FilterBar />

      {loading && entries.length === 0 ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          // ... (Rest of FlatList props are unchanged)
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchEntries(true)}
              tintColor={theme.primary} 
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
            ) : !hasMore && entries.length > 0 ? (
              <View style={{ padding: 14, alignItems: "center" }}>
                <ThemedText style={{ opacity: 0.7 }}>No more entries</ThemedText>
              </View>
            ) : null
          }
          ListEmptyComponent={<ListEmptyComponent />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },

  // 👇 NEW STYLE: For title and filter button
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  title: {
    fontSize: 28,
    fontWeight: "800",
    // Removed marginBottom and textAlign: "center" as it's now in a row
  },
  
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },

  entryContainer: {
    padding: 15,
    borderRadius: 14,
    marginBottom: 18,
  },

  date: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },

  titleEntry: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  moodBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },

  moodText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  activityText: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.8,
    marginBottom: 6,
  },

  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  actionButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },

  filterBar: {
    marginBottom: 12,
    zIndex: 10, 
  },

  searchBox: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    marginBottom: 10,
  },

  searchInput: {
    fontSize: 14,
    padding: 0,
  },

  moodRow: {
    marginBottom: 10,
  },

  moodChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },

  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
  },

  menuPopup: {
    position: 'absolute', 
    top: 160, 
    right: 0,
    left: 0,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    elevation: 4,
    zIndex: 20,
    maxHeight: 250, 
  },

  menuItem: {
    padding: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});