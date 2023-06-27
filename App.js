import "react-native-url-polyfill/auto";
import React, { useState } from "react";
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
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Define a Stack.Screen component for each screen */}
        {/*<Stack.Screen name="SignIn" component={SignIn} />*/}
        {/*<Stack.Screen name="SignUp" component={SignUp} />*/}
        <Stack.Screen name="Questionaire" component={Questionaire} />
        <Stack.Screen name="Questionaire2" component={Questionaire2} />
        <Stack.Screen name="Questionaire2" component={Questionaire2} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
