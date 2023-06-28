import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MessagingUI from './components/messages.js';
import ContactUI from './components/contacts.js';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Contacts"
          component={ContactUI}
          options={{
            headerTitle: 'Contacts',
            headerTitleStyle: {
              fontSize: 24,
              fontWeight: 'bold',
            },
            headerStyle: {
              backgroundColor: '#F9F9F9',
              borderBottomWidth: 1,
              borderBottomColor: '#DDD',
            },
          }}
        />
        <Stack.Screen
          name="Message"
          component={MessagingUI}
          options={{
            headerShown: false, // Hides the header for the "Message" screen
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
