import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import MessagingUI from "./messages";
import TabNavigator from "./TabNavigator";

const Stack = createStackNavigator();

const ThreeMainPages = ({ route }) => {
  const { session } = route.params;
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialParams={{ session }}
      >
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="Message"
          component={MessagingUI}
          initialParams={{ session }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default ThreeMainPages;
