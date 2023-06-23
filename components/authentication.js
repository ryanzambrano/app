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
import { supabase } from "./auth/supabase.js";
import SignIn from "./signIn.js";
import SignUp from "./signUp.js";
import Questionaire from "./questionaire1.js";
import Questionaire2 from "./questionaire2.js";
import MessagingUI from "./messages.js";
import TagSelectionScreen from "./tagSelectionScreen.js";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Session } from "@supabase/supabase-js";

const Stack = createStackNavigator();

const Authentication = ({ navigation }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      {/*<Stack.Screen name="messages" component={MessagingUI} />*/}
    </Stack.Navigator>
  );
};

export default Authentication;
