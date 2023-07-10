import "react-native-url-polyfill/auto";
import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Questionaire1 from "./questionaire1.js";
import Questionaire2 from "./questionaire2.js";
import Username from "./username.js";
import TagSelectionScreen from "./tagSelectionScreen.js";


const Stack = createStackNavigator();

const Questionaire = ({ navigation, route }) => {
  const { session } = route.params;
  useEffect(() => {
    if (!session) alert("session not found");
  }, [session]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Username"
        component={Username}
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
        name="TagSelectionScreen"
        component={TagSelectionScreen}
        initialParams={{ session }}
      />
      {/*<Stack.Screen name="messages" component={MessagingUI} />*/}
    </Stack.Navigator>
  );
};

export default Questionaire;
