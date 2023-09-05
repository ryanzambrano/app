import "react-native-url-polyfill/auto";
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import Questionaire1 from "./questionaire1.js";
import Questionaire2 from "./questionaire2.js";
import Questionaire3 from "./questionaire3.js";
import Username from "./username.js";
import Name from "./fullName.js";
import MatchingData from "./matchingData.js";
import TagSelectionScreen from "./tagSelectionScreen.js";
import Congrats from "./congrats.js";
import Colleges from "./college.js";

const Stack = createStackNavigator();

const Questionaire = ({ navigation, route }) => {
  const { session } = route.params;

  useEffect(() => {
    if (!session) alert("session not found");
  }, [session]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Name" component={Name} initialParams={{ session }} />
      <Stack.Screen
        name="Username"
        component={Username}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="Colleges"
        component={Colleges}
        initialParams={{ session }}
      />

      <Stack.Screen
        name="Questionaire1"
        component={Questionaire1}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="Questionaire2"
        component={Questionaire2}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="Questionaire3"
        component={Questionaire3}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="MatchingData"
        component={MatchingData}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="TagSelectionScreen"
        component={TagSelectionScreen}
        initialParams={{ session }}
      />
      <Stack.Screen
        name="Congrats"
        component={Congrats}
        initialParams={session}
        />
      {/*<Stack.Screen name="messages" component={MessagingUI} />*/}
    </Stack.Navigator>
  );
};

export default Questionaire;
