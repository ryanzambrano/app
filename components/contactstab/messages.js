import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../auth/supabase"; // we have our client here no need to worry about creating
import { createClient } from "@supabase/supabase-js";
/*const supabaseUrl = "https://jaupbyhwvfulpvkfxmgm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM";
const supabase = createClient(supabaseUrl, supabaseKey);*/

const MessagingUI = () => {
  const scrollViewRef = useRef();
  const [inputHeight, setInputHeight] = useState(40);
  const navigation = useNavigation();
  const route = useRoute();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contactName, setContactName] = useState("");
  const [contactImage, setContactImage] = useState("");

  const sendMessage = async () => {
    if (message.trim() !== "") {
      const { data, error } = await supabase
        .from("Message")
        .insert([
          {
            Content: message,
            Contact_ID: route.params.contactId,
            Sent_From: route.params.myId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
      } else {
        setMessages((prevMessages) => [...prevMessages, data]);
        setMessage("");
      }
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
  const { myId, contactId } = route.params;
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("Message")
      .select("*")
      .or(
        `and(Sent_From.eq.${myId},Contact_ID.eq.${contactId}),and(Contact_ID.eq.${myId},Sent_From.eq.${contactId})`
      )
      .order("createdat", { ascending: false })
      .limit(250);

    if (error) {
      console.error(error);
    } else {
      setMessages(data.reverse());
    }
  };

  useEffect(() => {
    fetchMessages();

    const Message = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Message" },
        (payload) => {
          console.log(payload.new);
          fetchMessages();
        }
      )
      .subscribe();
      return () => {
        supabase.removeChannel(channel);
      }
  }, [route.params.myId, route.params.contactId, messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        () => {
          setTimeout(() => {
            //flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
            flatListRef?.current?.scrollToIndex({
              animated: true,
              index: messages.length - 1,
            });
          }, 100);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
      };
    }
  }, [messages]);

  /*useEffect(() => {
    // Scroll to the bottom of the messages when a new message is added
    setTimeout(() => {
      //flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
      if(message.length > 0)
        {
          flatListRef?.current?.scrollToIndex({ animated: true, index: messages.length - 1 });
        }
    }, 100);
  }, [messages]);*/

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
      <View style={{ flex: 0.01 }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
        ></ScrollView>
      </View>
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
            <View
              style={
                item.Sent_From === myId
                  ? styles.messageContainerRight
                  : styles.messageContainerLeft
              }
            >
              <Text style={styles.message}>{item.Content}</Text>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContent}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { height: Math.max(40, inputHeight) }]}
          value={message}
          onChangeText={(text) => setMessage(text)}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          autoCorrect={true}
          multiline
          onContentSizeChange={(e) =>
            setInputHeight(e.nativeEvent.contentSize.height)
          }
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
  messageContainerRight: {
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: "flex-end",
    backgroundColor: "#dedede",
  },
  messageContainerLeft: {
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: "flex-start",
    backgroundColor: "#c4c4c4",
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
    marginRight: 0,
    color: "#333",
    borderRadius: 20,
    paddingHorizontal: 0,
    backgroundColor: "#FFF",
    fontSize: 20,
    paddingTop: 10,
  },
});

export default MessagingUI;
