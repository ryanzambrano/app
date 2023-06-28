import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
//import ContactUI from "./components/contact.js"

const MessagingUI = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (message.trim() !== '') {
      setMessages(prevMessages => [message, ...prevMessages]); // Prepend the new message to the messages array
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
      <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate('Contacts')} // Replace 'OtherPage' with the name of the desired page component to navigate to
>
  <AntDesign name="arrowleft" size={24} color="#007AFF" />
</TouchableOpacity>
  <View style={styles.profileContainer}>
    {/* Replace the placeholder with your circular profile picture component */}
    <View style={styles.profilePicture} />
  </View>
</View>
      <View style={styles.messagesContainer}>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{item}</Text>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContent}
          inverted // Reverse the order of messages to display the most recent at the bottom
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={text => setMessage(text)}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <Button title="Send" onPress={sendMessage} color="#007AFF" />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F9F9F9',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align items vertically to the bottom
    marginBottom: 20, // Increase the margin bottom for lower positioning
    paddingHorizontal: 10,
    paddingVertical: 20,
  },  
  button: {
    padding: 10,
    marginBottom: 0,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dedede',
    overflow: 'hidden',
    marginRight: 10,
  },
  profilePicture: {
    flex: 1,
    backgroundColor: 'lightgray',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#dedede',
  },
  message: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
    color: '#333',
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
  },
});

export default MessagingUI;
