import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Package that allows for a bottom tab navigator
import Icon from "react-native-vector-icons/FontAwesome"; // Package that introduces icons
import View from "react-native";
import ContactsUI from "../contactstab/contacts"; // Imports for use in Tab Navigator
import Home from "../hometab/home";
import Profile from "../profiletab/profile";

const Tab = createBottomTabNavigator(); // Initializes bottom tab navigator

const TabNavigator = ({ route }) => {
  const { session } = route.params;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          paddingHorizontal: 5,
          paddingTop: 0,
          backgroundColor: "#111111",
          //position: "absolute",
          borderTopWidth: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Contacts") {
            // Based on where the user clicks, it highlights the icon to clarify what page they are on
            iconName = focused ? "comment" : "comment"; // Set the icons for the 'Messages
          } else if (route.name === "Home") {
            iconName = focused ? "home" : "home"; // Set the icons for the 'Home' screen
          } else if (route.name === "Profile") {
            iconName = focused ? "user" : "user"; // Set the icons for the 'Profile' screen
          }

          return (
            <Icon
              name={iconName}
              size={size}
              color={focused ? "white" : "grey"}
            />
          );
        },
        tabBarLabel: () => null, // Removes the labels
      })}
    >
      <Tab.Screen
        name="Contacts"
        component={ContactsUI}
        initialParams={{ session }} // These three Tab.Screen blocks bring in the components from each of the files that allow the Tab navigator to access and change pages
      />
      <Tab.Screen name="Home" component={Home} initialParams={{ session }} />
      <Tab.Screen
        name="Profile"
        component={Profile}
        initialParams={{ session }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
