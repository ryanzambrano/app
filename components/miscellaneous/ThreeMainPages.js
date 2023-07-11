import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import MessagingUI from "../contactstab/messages";
import TabNavigator from "./TabNavigator";
import ProfileUI from "../contactstab/otherprofile";

import UserCard from "../hometab/userCard.js";
import SettingsScreen from "./settings";
import AddProfileImages from "../profiletab/addProfileImages";

const Stack = createStackNavigator();

const ThreeMainPages = ({ route }) => {
  const { session } = route.params;
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="userCard"
          component={UserCard}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="Message"
          component={MessagingUI}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="OtherProfile"
          component={ProfileUI}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="AddProfileImages"
          component={AddProfileImages}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          initialParams={{ session }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default ThreeMainPages;
