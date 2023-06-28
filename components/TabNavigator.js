import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

import MessagingUI from './messages';
import Home from './home';
import Profile from './profile';


const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Messages') {
          iconName = focused ? 'comment' : 'comment-o'; // Set the icons for the 'Messages
        }
        else if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home'; // Set the icons for the 'Home' screen
        } 
        else if (route.name === 'Profile') {
          iconName = focused ? 'user' : 'user'; // Set the icons for the 'Profile' screen
        }
      

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarLabel: () => null, // Remove the labels
    })}
    tabBarOptions={{
      showIcon: true, // Show the icons
    }}
  >
    
    <Tab.Screen name="Messages" component={MessagingUI} />
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Profile" component={Profile} /> 

  </Tab.Navigator>
  );
};

export default TabNavigator;
