import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ContactUI = () => {
  const navigation = useNavigation();

  const contacts = [
    { id: '1', name: 'John Doe', message: 'Hello there!', time: '10:30 AM' },
    { id: '2', name: 'Jane Smith', message: 'Hey, how are you?', time: '11:45 AM' },
    { id: '3', name: 'Alex Johnson', message: 'What are you up to?', time: '1:15 PM' },
    // Add more contacts as needed
  ];

  const handleContactPress = () => {
    navigation.navigate('Message'); // Navigate to the "Message" screen
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity style={styles.contactItem} onPress={handleContactPress}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactMessage}>{item.message}</Text>
      </View>
      <Text style={styles.contactTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactMessage: {
    fontSize: 16,
    color: '#888',
  },
  contactTime: {
    fontSize: 14,
    color: '#888',
  },
});

export default ContactUI;
