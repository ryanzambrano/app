import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';


const Home = () => {
  
  const users = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' },
  
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        {users.map((user) => (
          <View key={user.id} style={styles.userContainer}>
            <Text>{user.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
  },
});

export default Home;