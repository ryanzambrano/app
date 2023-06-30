import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

const ProfileUI = ({ route }) => {
  const { contactName, contactImage } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: contactImage }} style={styles.profilePicture} />
      <Text style={styles.contactName}>{contactName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  contactName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProfileUI;
