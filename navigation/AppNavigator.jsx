import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Landing from "../screens/Landing";
import Login from "../screens/Login";
import Signup from "../screens/Signup";
import AllEntries from "../screens/AllEntries";
import NewEntry from "../screens/NewEntry";
import EditEntry from "../screens/EditEntry";
import Profile from "../screens/Profile";
import Logout from "../screens/Logout";
import EditProfile from "../screens/EditProfile";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- 1. Main App Tabs ---
function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.uiBackground,
          borderTopColor: theme.inputBorder,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "NewEntryTab") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "AllEntriesTab") {
            iconName = focused ? "book" : "book-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{ title: "Profile" }}
      />

      <Tab.Screen
        name="NewEntryTab"
        component={NewEntry}
        options={{ title: "NewEntry" }}
      />

      <Tab.Screen
        name="AllEntriesTab"
        component={AllEntries}
        options={{ title: "Journal" }}
      />
    </Tab.Navigator>
  );
}

// --- 2. App Navigator (Auth Flow) ---
export default function AppNavigator() {
  const { user } = useAuth();

  // If user is not logged in, show Landing and Auth flow
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
      </Stack.Navigator>
    );
  }

  // If user is logged in, show main app content
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* This holds the Tab Bar (Profile, AllEntries) */}
      <Stack.Screen name="Main" component={MainTabs} />

      {/* These screens should be accessible from anywhere in the app, usually presented full-screen or as a modal */}
      <Stack.Screen name="NewEntry" component={NewEntry} />
      <Stack.Screen name="EditEntry" component={EditEntry} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Logout" component={Logout} />
    </Stack.Navigator>
  );
}
