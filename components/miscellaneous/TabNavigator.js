import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { KeyboardAvoidingView, Platform } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import View from "react-native";
import ContactsUI from "../contactstab/contacts";
import Home from "../hometab/home";
import Profile from "../profiletab/profile";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const TabNavigator = ({ route }) => {
  const { session } = route.params;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            paddingHorizontal: 5,
            paddingTop: 0,
            backgroundColor: "#111111",
            // position: "absolute", // Comment out or remove this line
            borderTopWidth: 1.5,
            borderTopColor: "#1D1D20",
          },
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "Contacts") {
              return (
                <MaterialCommunityIcons
                  name="message-reply-outline"
                  size={27}
                  color={focused ? "white" : "grey"}
                />
              );
            } else if (route.name === "Home") {
              return (
                <AntDesign
                  name="home"
                  size={27}
                  color={focused ? "white" : "grey"}
                />
              );
            } else if (route.name === "Profile") {
              return (
                <Feather
                  name="user"
                  size={27}
                  color={focused ? "white" : "grey"}
                />
              );
            }
          },
          tabBarLabel: () => null,
        })}
      >
        <Tab.Screen
          name="Contacts"
          component={ContactsUI}
          initialParams={{ session }}
        />
        <Tab.Screen name="Home" component={Home} initialParams={{ session }} />
        <Tab.Screen
          name="Profile"
          component={Profile}
          initialParams={{ session }}
        />
      </Tab.Navigator>
    </KeyboardAvoidingView>
  );
};

export default TabNavigator;
