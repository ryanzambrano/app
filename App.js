<<<<<<< Updated upstream
import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, TextInput, View, Image, SafeAreaView, TouchableOpacity, Button } from 'react-native';
//import { supabase } from './components/auth/supabase.js';
//import SignIn from './components/signIn.js';
//import SignUp from './components/signUp.js';
//import Questionaire from './components/questionaire.js';
import MessagingUI from './components/messages.js';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
=======
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
import SignIn from "./components/signIn.js";
import SignUp from "./components/signUp.js";
import Questionaire from "./components/questionaire.js";
import Questionaire2 from "./components/questionaire2.js";
import MessagingUI from "./components/messages.js";
import TagSelectionScreen from "./components/tagSelectionScreen.js";
import Username from "./components/username.js";
import Email from "./components/emailValidation.js";
import Authentication from "./components/authentication.js";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Session } from "@supabase/supabase-js";
>>>>>>> Stashed changes

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
<<<<<<< Updated upstream
      <Stack.Navigator>
        {/* Define a Stack.Screen component for each screen */}
        {/*<Stack.Screen name="SignIn" component={SignIn} />*/}
        {/*<Stack.Screen name="SignUp" component={SignUp} />*/}
        {/*<Stack.Screen name="Questionaire" component={Questionaire} />*/}
        <Stack.Screen name="Message" component={MessagingUI} />

=======
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          hasProfile ? (
            <Stack.Screen
              key={session?.user?.id ?? "TagSelectionScreen"}
              name="TagSelectionScreen"
              component={TagSelectionScreen}
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
>>>>>>> Stashed changes
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

