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
import { picURL } from "../auth/supabase.js";
import { AntDesign } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import { useNavigation, useRoute,useFocusEffect } from "@react-navigation/native";
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
  const { session } = route.params;
  const { user } = route.params;
  const {editedJoinedGroups} = route.params;
  const [joinedGroups, setJoinedGroups] = useState(user.joinedGroups);

  const sendMessage = async () => {
    if (message.trim() !== "") {
      const { data, error } = await supabase
        .from("Group Chat Messages")
        .insert([
          {
            Message_Content: message,
            Group_ID_Sent_To: user.Group_ID,
            Sent_From: session.user.id,
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
      if (messages.length > 1) {
      setTimeout(() => {
        //flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
        flatListRef?.current?.scrollToIndex({
          animated: true,
          index: messages.length - 1,
        });
      }, 100);
    }
    }

  };
  useEffect(() => {

    if (editedJoinedGroups !== undefined) {
      setJoinedGroups(editedJoinedGroups);
    }
  });


  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("Group Chat Messages")
      .select("*")
      .eq("Group_ID_Sent_To",user.Group_ID)
      .order("created_at", { ascending: false })
      .limit(250);

    if (error) {
      console.error(error);
    } else {
      setMessages(data.reverse());
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
  .channel("custom-all-channel")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "Group Chat Messages",
      filter: {
        "Group_ID_Sent_To": user.Group_ID,
      },
    },
    (payload) => {
      fetchMessages();
    }
  )
  .subscribe();

return () => {
  supabase.removeChannel(channel);
};
  }, [session.user.id, messages]);

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
    }, 100);Fg
  }, [messages]);*/

  const flatListRef = React.useRef();

  const navigateToProfile = () => {
    navigation.navigate("GroupChatScreen", {user});
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
          <AntDesign name="arrowleft" size={24} color="#159e9e" />
        </TouchableOpacity>
        <Text style={styles.contactName}>{joinedGroups}</Text>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={navigateToProfile}
        >
          {(
            <Image
              //source={{ uri: `${picURL}/${user_id}/${user_id}-0?${new Date().getTime()}` }}
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
        item.Sent_From === session.user.id
          ? styles.messageContainerRight
          : styles.messageContainerLeft
      }
    >
      <Text
        style={[
          styles.message,
          item.Sent_From === session.user.id
            ? { color: "white" } // Change text color for messages from current user
            : null, // Use default text color for messages from other user
        ]}
      >
        {item.Message_Content}
      </Text>
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
        <Button title="Send" onPress={sendMessage} color="#159e9e" text = "bold" />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1D1D20",
    marginBottom: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 0,
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
    color: 'white',
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
    backgroundColor: "#14999999",
  },
  messageContainerLeft: {
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: "flex-start",
    backgroundColor: "#e8e8ea",
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
    backgroundColor: "#111111",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginBottom: 25,
    paddingTop: 0,
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 0,
    color: "white",
    borderRadius: 20,
    paddingHorizontal: 0,
    backgroundColor: "#111111",
    fontSize: 20,
    paddingTop: 10,
  },
});

export default MessagingUI;
