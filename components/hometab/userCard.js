import React from 'react';
import { View, Text } from 'react-native';

const UserCard = ({ route }) => {
  const { userId } = route.params;

  return (
    <View>
      <Text> User Profile </Text>
      <Text> UserId: {userId} </Text>
    </View>
  );
};

export default UserCard;
