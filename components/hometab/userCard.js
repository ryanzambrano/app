import React from 'react';
import { StyleSheet, SafeAreaView, Text } from 'react-native';

const UserCard = ({ route }) => {
  const { name, bio } = route.params.user;

  return (
    <SafeAreaView style={styles.container}>
      <Text> Name: {name} </Text>
      <Text> Bio: {bio} </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    marginTop: 50,
  },
});

export default UserCard;
