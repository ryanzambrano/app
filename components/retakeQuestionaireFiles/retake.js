import "react-native-url-polyfill/auto";
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import Retake1 from "./retake1.js";
import Retake2 from "./retake2.js";
import Retake3 from "./retake3.js";
import Retake4 from "./retake4.js";
import Congrats from "../questionairefiles/congrats";

const Stack = createStackNavigator();

const Retake = ({ navigation, route }) => {
  const { session } = route.params;

  useEffect(() => {
    if (!session) alert("session not found");
  }, [session]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Retake1"
        component={Retake1}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="Retake2"
        component={Retake2}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="Retake3"
        component={Retake3}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="Retake4"
        component={Retake4}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="Congrats"
        component={Congrats}
        initialParams={session}
      />
    </Stack.Navigator>
  );
};

export default Retake;
