import "react-native-url-polyfill/auto";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Button,
} from "react-native";
import { supabase } from "./components/auth/supabase.js";
import Authentication from "./components/authentication.js";
import Questionaire from "./components/questionaire.js";
import TagSelectionScreen from "./components/tagSelectionScreen.js";
import ProfileScreen from "./components/profile.js";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import TabNavigator from "./components/TabNavigator.js";
import ThreeMainPages from "./components/ThreeMainPages.js";
import Home from "./components/home.js";

// npm install @react-navigation/native @react-navigation/bottom-tabs react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view

// npm install @react-navigation/native @react-navigation/material-bottom-tabs react-native-paper react-native-vector-icons

// npm install @react-navigation/native react-native-tab-view react-native-gesture-handler react-native-reanimated
// npm install react-native-vector-icons

const Stack = createStackNavigator();

const App = () => {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkUserProfile(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkUserProfile(session);
    });
  }, []);

  const checkUserProfile = async (session) => {
    if (session?.user) {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select("profile_complete")
        .eq("user_id", session.user.id)
        .single();

      if (data == null) {
        // User does not have a profile, insert a new profile
        const { data, error } = await supabase
          .from("profile")
          .insert([{ user_id: session.user.id, profile_complete: false }]);

        if (data == true) {
          setHasProfile(hasProfile);
        }

        if (error) {
          throw new Error("error.message");
        }
      } else {
        const hasProfile = !!data.profile_complete;
        setHasProfile(hasProfile);
      }
    }
    setIsLoading(false);
  };

  if (isLoading) {
    // Render a loading state or splash screen
    return (
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://cdn3.iconfinder.com/data/icons/furniture-volume-1-2/48/12-512.png",
          }}
          style={styles.headerImage}
          alt="Logo "
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          hasProfile ? (
            <Stack.Screen
              key={session?.user?.id ?? "ThreeMainPages"}
              name="ThreeMainPages"
              component={ThreeMainPages}
              initialParams={{ session }}
            />
          ) : (
            <Stack.Screen
              key={session?.user?.id ?? "TagSelectionScreen"}
              name="questionaire"
              component={Questionaire}
              initialParams={{ session }}
            />
          )
        ) : (
          <>
            <Stack.Screen name="Authentication" component={Authentication} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    justifySelf: "center",
  },
  headerImage: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 25,
  },
});

export default App;
