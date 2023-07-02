import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import TabNavigator from './TabNavigator';

const ThreeMainPages = () => {
  
  return (
    <NavigationContainer independent={true}>
      <TabNavigator/>
    </NavigationContainer>
  );
};

export default ThreeMainPages;
