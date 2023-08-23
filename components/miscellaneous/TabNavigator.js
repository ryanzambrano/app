import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Package that allows for a bottom tab navigator
import FontAwesome from "react-native-vector-icons/FontAwesome"; 
import Ionicons from "react-native-vector-icons/Ionicons";
import View from "react-native";
import ContactsUI from "../contactstab/contacts"; // Imports for use in Tab Navigator
import Home from "../hometab/home";
import Profile from "../profiletab/profile";
import { MaterialIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';  
import { FontAwesome5 } from '@expo/vector-icons'; 

const Tab = createBottomTabNavigator(); // Initializes bottom tab navigator

const TabNavigator = ({ route }) => {
  const { session } = route.params;
  return (
    <Tab.Navigator
      initialRouteName="Contacts"
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
          if (route.name === "Contacts") {
            return <MaterialIcons name="chat-bubble-outline" size={24} color={focused ? "white" : "grey"} />
          } else if (route.name === "Home") {
            return <Foundation name="home" size={24} color={focused ? "white" : "grey"} />
          } else if (route.name === "Profile") {
            return <FontAwesome5 name="user" size={24} color={focused ? "white" : "grey"} />
          }
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
