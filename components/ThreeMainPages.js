import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MessagingUI from './messages';
import TabNavigator from './TabNavigator';
import ProfileUI from './otherprofile';

const Stack = createStackNavigator();

const ThreeMainPages = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Message" component={MessagingUI} />
        <Stack.Screen name="OtherProfile" component={ProfileUI} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default ThreeMainPages;
