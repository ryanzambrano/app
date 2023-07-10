import React, { useState, useEffect } from "react";

import {
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const MessagingUI = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contactName, setContactName] = useState("");
  const [contactImage, setContactImage] = useState("");

  const sendMessage = () => {
    if (message.trim() !== "") {
      setMessages((prevMessages) => [message, ...prevMessages]);
      setMessage("");
    }
  };

  useEffect(() => {
    if (route.params && route.params.contactName) {
      setContactName(route.params.contactName);
    }
    if (route.params && route.params.contactImage) {
      setContactImage(route.params.contactImage);
    }
  }, [route.params]);

  useEffect(() => {
    // Scroll to the bottom of the messages when a new message is added
    setTimeout(() => {
      flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
    }, 100);
  }, [messages]);

  const flatListRef = React.useRef();

  const navigateToProfile = () => {
    navigation.navigate("OtherProfile", { contactName, contactImage });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 2 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.contactName}>{contactName}</Text>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={navigateToProfile}
        >
          {contactImage && (
            <Image
              source={{ uri: contactImage }}
              style={styles.profilePicture}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{item}</Text>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContent}
          inverted
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={(text) => setMessage(text)}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          autoCorrect={false}
          multiline
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
    backgroundColor: "#F9F9F9",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  button: {
    padding: 10,
    marginBottom: 0,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    paddingVertical: 20,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dedede",
    overflow: "hidden",
    marginRight: 10,
  },
  profilePicture: {
    width: "100%",
    height: "100%",
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
    alignSelf: "flex-end",
    backgroundColor: "#dedede",
  },
  message: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    paddingTop: 0,
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
    color: "#333",
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "#FFF",
    fontSize: 20,
    paddingTop: 10,
  },
});

export default MessagingUI;
