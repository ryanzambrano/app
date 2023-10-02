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
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import { supabase } from "../auth/supabase"; // we have our client here no need to worry about creating
import * as Animatable from 'react-native-animatable';

const MessagingUI = () => {
  const isFocused = useIsFocused();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const scrollViewRef = useRef();
  const [inputHeight, setInputHeight] = useState(40);
  const navigation = useNavigation();
  const route = useRoute();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { session } = route.params;
  const { user } = route.params;
  const { editedJoinedGroups } = route.params;
  const [joinedGroups, setJoinedGroups] = useState("");
  const [persons, setPersons] = useState([]);
  const [senderNames, setSenderNames] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const sendMessage = async () => {
    if (!isButtonDisabled && message.trim() !== "") {
      setIsButtonDisabled(true); // Disable the button

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
        animateMessage();
      }

      if (messages.length > 1) {
        setTimeout(() => {
          flatListRef?.current?.scrollToIndex({
            animated: true,
            index: messages.length - 1,
          });
        }, 100);
      }

      // Re-enable the button after a 1-second cooldown
      setTimeout(() => setIsButtonDisabled(false), 1000);
    }
  };

  const extractedIds = user.User_ID.filter((item) => item !== session.user.id);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("UGC")
        .select("*")
        .in("user_id", extractedIds);

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        const fetchedPersons = data.reduce((acc, person) => {
          acc[person.user_id] = person.name;
          return acc;
        }, {});
        setSenderNames(fetchedPersons);

        // Check if user.images[0] exists and has a last_modified property
        if (user.images[0] && user.images[0].last_modified) {
          // Map last_modified to lastModified for each person in data
          const people = data.map((person) => ({
            ...person,
            lastModified: user.images[0].last_modified,
          }));
          setPersons(people);
        } else {
          const peoples = data.map((person) => person);
          // If user.images[0] does not exist or doesn't have last_modified, setPersons with the original data
          setPersons(peoples);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  }

  async function getJoinedGroups() {
    try {
      const { data, error: sessionError } = await supabase
        .from("UGC")
        .select("name")
        .eq("user_id", session.user.id)
        .single();

      const { data: groupchatdata, error } = await supabase
        .from("Group Chats")
        .select("*")
        .eq("Group_ID", user.Group_ID)
        .single();

      if (sessionError) {
        console.error(sessionError);
        return null;
      }
      const extractedIds = user.User_ID.filter(
        (item) => item !== session.user.id
      );
      const { data: UGCdata, error: sessionErrors } = await supabase
      .from("UGC")
      .select("name")
      .in("user_id", extractedIds);
      let Groupnames;
      if(!user.Group_Name)
      {
        const joinedGroups = UGCdata.map(item => item.name);
        Groupnames = joinedGroups.join(", ");
      }
      else
      {
        Groupnames = user.Group_Name;
      }
    


      setJoinedGroups(Groupnames);
      return;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  useEffect(() => {
    if (isFocused) {
      getJoinedGroups();
    }
    if (user.Ammount_Users <= 2) {
      fetchUsers();
    }
    if (editedJoinedGroups !== undefined) {
      setJoinedGroups(editedJoinedGroups);
    }
  }, [user.User_ID, session.user.id, isFocused]);

  useEffect(() => {
    // This effect will run whenever isButtonDisabled changes
    if (isButtonDisabled) {
      // If the button is disabled, re-enable it after 1 second
      const timeout = setTimeout(() => setIsButtonDisabled(false), 1000);
      
      // Cleanup the timeout if the component unmounts or the dependency changes
      return () => clearTimeout(timeout);
    }
  }, [isButtonDisabled]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("Group Chat Messages")
      .select(`*, UGC (name)`)
      .eq("Group_ID_Sent_To", user.Group_ID)
      .order("created_at", { ascending: false })
      .limit(250);

    if (error) {
      console.error(error);
    } else {
      setMessages(data.reverse());
    }
    if (data.name && data.UGC.name) {
      //console.log(data.UGC.name);
    }
  };
  animateMessage = () => {
    this.messageRef.fadeIn(250); // You can adjust the duration (1000ms in this example)
  }

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
            Group_ID_Sent_To: user.Group_ID,
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

  const flatListRef = React.useRef();

  const navigateToProfile = () => {
    if (user.Ammount_Users > 2) {
      navigation.navigate("GroupChatScreen", { user });
    } else {
      navigation.navigate("userCard", { user: persons[0] });
    }
  };
  const renderProfilePicture = (item) => {
    if (!user.images) {
      return (
        <Image
          style={styles.layeredImage}
          source={{
            uri: "data:image/png;base64,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", // Replace with actual URL
          }}
        />
      );
    }

    if (user.Ammount_Users > 2 && user.images.length > 1) {
      // Overlay two profile pictures
      return (
        <View style={{ position: "relative" }}>
          <Image
            style={[styles.layeredImage, { zIndex: 1, bottom: 0 }]}
            source={{
              uri: `${picURL}/${user.images[0].user_id}/${user.images[0].user_id}-0-${user.images[0].last_modified}`, // Replace with actual URLs
            }}
          />
          <Image
            style={[
              styles.layeredImage,
              { zIndex: 2, position: "absolute", top: 0, left: 14 },
            ]}
            source={{
              uri: `${picURL}/${user.images[1].user_id}/${user.images[1].user_id}-0-${user.images[1].last_modified}`, // Replace with actual URLs
            }}
          />
        </View>
      );
    }
    if (user.Ammount_Users > 2 && user.images.length > 0 && user.images[1]) {
      // Overlay two profile pictures
      return (
        <View style={{ position: "relative" }}>
          <Image
            style={[styles.layeredImage, { zIndex: 1, bottom: 0 }]}
            source={{
              uri: "data:image/png;base64,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", // Replace with actual URL
            }}
          />
          <Image
            style={[
              styles.layeredImage,
              { zIndex: 2, position: "absolute", top: 0, left: 17 },
            ]}
            source={{
              uri: `${picURL}/${user.images[0].user_id}/${user.images[0].user_id}-0-${user.images[0].last_modified}`,
            }} // Replace with actual URLs
          />
        </View>
      );
    }
    if (user.Ammount_Users > 2 && user.images.length == 0) {
      // Overlay two profile pictures
      return (
        <View style={{ position: "relative" }}>
          <Image
            style={[styles.layeredImage, { zIndex: 1, bottom: 0 }]}
            source={{
              uri: "data:image/png;base64,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", // Replace with actual URL
            }}
          />
          <Image
            style={[
              styles.layeredImage,
              { zIndex: 2, position: "absolute", top: 0, left: 17 },
            ]}
            source={{
              uri: "data:image/png;base64,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", // Replace with actual URL
            }}
          />
        </View>
      );
    }
    if (user.Ammount_Users < 3 && user.images.length == 1) {
      // Single profile picture
      return (
        <Image
          style={styles.layeredImage}
          source={{
            uri: `${picURL}/${user.images[0].user_id}/${user.images[0].user_id}-0-${user.images[0].last_modified}`, // Replace with actual URLs
          }}
        />
      );
    } else {
      return (
        <Image
          style={styles.layeredImage}
          source={{
            uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAALVBMVEX////d3d3a2trk5OTf39/5+fnz8/P8/Pzn5+f29vbw8PDe3t7s7Ozj4+Pt7e3oCmspAAAJJUlEQVR4nO1d24KkKgzsRvGu//+5R6Vttb0hVQGcs/WwDzszaElIQkjC6+UDuS6zquqaHsXwT1dVWalzL88Whs66oq3VgPca5v/aost06Jd0RdkV6ZbYFv3vpEVXhn7de8izgdwltzXPtMgeIrZlc5fdgmUT/VxmiSO7mWWShSZxDJhe3CTLgkJvIlnEJq5dzaP3IVl3oUnN0AWb3odkEYepLFsZfiPHNrywZqkcv5FjGlbrSPMLzbH0wM9wDCOrWnD9bTi2AXSOkP485Fh45lf55TdyrDzy054W4A/F1JuoNiH4jRwbL/x0HYjfgNrDNAabQAPxacw9mogDiqloJCALzW+AEvRxPNvAI8jZxuASOkG1Ivx0aF4rCOjUKJbgDP5iDGwktmCbjUh0zBJcfRONjlmCqW/a0GQOQKOYhmZyiPSvEyRRDLmVuEaNE4x5BgfAsxg7QZhirFp0CUijJqHf3gqJO8EIPZk9uHs33TMI9hQdD+LKpxB03Wno5xDsKbrsF+O29L9wsPxPsBNL3LYZ0e14r3BX2zxIy0xQ9w4ZQ7+uE+4QfIYv84sbvk2A00EG7E8Y82cS7CnaHmk8zVDMsDQZD5XRAXZy+lgZHWAlp8/UoxMs9OkDbf0SFnb/WQ73FpcuuOSuV02Qe4SFfyry9J5UWzRVVpZaD7UlXZG8xXiqc4IF/4EqbXbLDMqOkxa+wWnUhm0phqT0M/1dNm8+yVOLwbUUqrUwwCU/oHdiMaihGfss7Y48kSdBG+IUquJOYk/F5Xg4ibwpvMdvANVKHU4iS5G6ZS0z1+OBOmUpUucINOfx4yvsixBpCoE8V9407k8iZXgsB4SWlrTr2FSUkcFkbFpq2d57MDYVN2OWeyCFUHa2GJR9ISOfjmOUd741Q89wsncTymLc6gPCsKz0ZMosbnQNrmesg5XXoKzFX10DD+p0RnkERo7LT+wU9mfIGa0Ehj8y1aHDkfNZGZuAtfOIigU9tZwQeF8lS6FCStQyE3CFunopUJOK1HjADFfaFNSkIuUPuBe+fC2wl4VMJRJuwGifS6icjGnBQJ9UhiDBVZ59U8hWyNXnwpOYkkaSIvh6NSDDr4LAlqFgiTVspqeFCH2qi6MeDOhKnHQgpJZF63JR93SyiMgw1E3TFqC/rAgfilSXcwTUnTTfH3LjhVs5gLrmY8kQRSPksM0AXbcGHkRYSOGtuVE1yAjijSpQbToOAoxBiHFfASOo0K8kau4NsL3+qEwRn018GaILcfTbkCE8tDYC965DwA3x/Tw0/gMt4jAHgKBLdhn5AmM4pGUA5lDYKTXAXNPBIAJ/Lu7RDAC9mhdmDj0QBPeICmMoGMCYgYUyFKirHsAwh1waDwYfNvl/n6H+HzCEskx8MATXYfmP4fmf+2AI2kOQYfw+Dcowfr8UZRj/3gLVNPHvD3uGUDDLwx4fzJkELX78cZqBISQF0cfaRnUPMYw9XgrvD+OPeSv0I8V+bjE6llgiRuRnT+MUYEs57vNDE03EPFuZjr5fwMnZg8WG4yCSgNOhB1UI5qpGnYthjrnRUhJJhnBm22iwOckAMoBTTM0iAochdBA9AprXNrmVoMkRnEQ8m92oeljYpQjiU/jZ3qE2x7Uq9gqMql0jX3BdnpBNJBR4TXsf+FsBLVKPwaiYnfavcPVopPUWs54nFFfyCVKKEKc4EqHGOca6p/e88yEUisVYu7aMWDMGi67+cMB3PEaVMzXCTypZn8O5lGYDtEJnXheZ2Z8k9fxgUWS1x1h6Ipzu+TWHIq3/xzIQSPBxRzAo8hqcLPU7rZUgrm54rUXXAXnaqKDRyJm3TaxGpnWiw/rTUNtSFlJDA7f3UZuI/54aMYd2DGto8n0ov5+POLTb7b3sLvC/njL3JoT7q5HjVi1fYfOVySJyb7MhcL/39tyP3gFaNbYqp6oFGmDuKAOBpyQW1lFLNPjczzDgN2ftn/MuTknqRup26D1FIHTrilJtt5vPoKtCZPbMU3e1uVyzeaXeSdNlpdZ5PjYSbopUtl/yftxIupO38tIL2jzqIAsm/jvWbHGUIhLZdbHuON7h/JVJPM7y+SOTeLZJ/RuTeJao9Scm8TzO8NwLWGacn6EAjs1o6NK2TTC0bfqGbOZV8N3JOx19lqzkBb1znTWu1ydcHdfeD3/33nUlc8ydu3iu10fu95qj9/Rk04TLmyRt0iZunHmr1kfBRXbn3nOb/CVrB9z+8gMU2jrSb5d4bqds7l8OgCC35GgZAbPh5xQwRKCtZNVyMAvPxsf627zW9Xe3fq0LOcXOJgBcieqN9yJ9KToupOvGSGfOG3DyguPs9O1ersThIUIwCZ1wKKl3UyQPNhlSmZY3cOR03U7L2icYbgnOOFiMt8fZW4oeStVssOd1uSQsbY9qIiG4R9HtVPZ3TUdDcEvRVf+1sRLcUHRO/lwanyiUzIyVunGvgswXBMObiTWWRgPwQeaYRmhDv8XXecZKBSabIVxm6ITW3U4sYZa0YG0TgJqjAA3FmPTohJKl4UeKkWnSAaM25ZgwQzFKXcqy0YZiXNq0YBL83GinYtKnJixFjIYZ00/K48aR16ih30EakWtq1Du9YcV4ox27+McJY4RFCVQEmoHDL8ZW7lN/3PmwklqKbnR0jew2KTC78lruSMFcL1mHmsbSfGKRotwJJngTaBrNBIo2cXgNQWezGv37qeZgRnkIuZtwuEr8mv/cLBA/5kqnHh/2weezAjdiuzxPvIXSF59SBZ/fNDeer6q9ZCqYVH7V+l0XnwNZlUpz/JZi+NdtH1GV5TjxC+MQT/kRSqzJZ/fJFvKb97GEnq7Qlkit+SbRqMR33sfqNb4cW65irdoo+A2YP7WipbiVhRIUjvvIv5VLlDy+OVdPva2Lw8RRfcuX+pnM3F8rz76z1ytpXw6FHfTi1VTauFiQrJlLhXppiEE8f5Alc1Jvz7Ko7N9RV8tCKGVV1hcGS5KGZpfpU6HVWbeu8oqZnkH2k9Q75rcnRdNVWVlqg7LMqqopkjFnffXLF/WKsWCsLNymS6yx/fE7uSHX4dGzbG1rCvrfa++s2oigs7GU8pDo8KO0aLJHklsg10PRaDGUirw/Apq2bVE01YUW+gc7/Ae+CoL+juvgcwAAAABJRU5ErkJggg==", // Replace with actual URL
          }}
        />
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? -5 : 0}
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
          onPress={() => navigation.navigate("Contacts")}
        >
          <AntDesign name="arrowleft" size={24} color="#159e9e" />
        </TouchableOpacity>
        <Text style={styles.contactName} numberOfLines={1}>
          {joinedGroups}
        </Text>
        <TouchableOpacity onPress={navigateToProfile}>
          {renderProfilePicture()}
        </TouchableOpacity>
      </View>
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item, index }) => {
            const isOwnMessage = item.Sent_From === session.user.id;
            const isFirstOwnMessage =
              isOwnMessage &&
              (index === 0 ||
                messages[index - 1].Sent_From !== session.user.id);
            const isOtherMessage = item.Sent_From !== session.user.id;
            const isFirstOtherMessage =
              isOtherMessage &&
              (index === 0 ||
                messages[index - 1].Sent_From === session.user.id);
            const shouldDisplaySenderName =
              user.Ammount_Users >= 3 && isFirstOtherMessage;

            return (
              <Animatable.View ref={(ref) => this.messageRef = ref}>
              <View>
                {shouldDisplaySenderName && (
                  <Text style={styles.senderName}>{item.UGC.name}</Text>
                )}
                <View
                  style={[
                    styles.messageContainer,
                    isOwnMessage
                      ? styles.messageContainerRight
                      : styles.messageContainerLeft,
                    // conditionally apply the smaller margin styles
                    isFirstOwnMessage
                      ? {}
                      : styles.messageContainerRightSmallMargin,
                    isFirstOtherMessage
                      ? {}
                      : styles.messageContainerLeftSmallMargin,
                  ]}
                >
                  <Text
                    style={[
                      styles.message,
                      isOwnMessage ? { color: "white" } : { color: "white" },
                    ]}
                  >
                    {item.Message_Content}
                  </Text>
                </View>
              </View>
              </Animatable.View>
            );
          }}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContent}
        />
      </View>
      <View style={styles.inputContainer}>
      <TextInput
    style={[
      styles.input,
      { height: Math.min(200, Math.max(40, inputHeight)) } // Set maximum height to 100
    ]}
          value={message}
          onChangeText={(text) => setMessage(text)}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          autoCorrect={true}
          multiline
          onContentSizeChange={(e) =>
            setInputHeight(e.nativeEvent.contentSize.height)
          }
          keyboardAppearance="dark"
        />
        <Button
          title="Send"
          onPress={sendMessage}
          color="#159e9e"
          text="bold"
          disabled={isButtonDisabled}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  layeredImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dedede",
    overflow: "hidden",
    marginRight: 10,
  },
  senderName: {
    marginVertical: 2,
    paddingBottom: 4,
    color: "#afafb2",
    fontWeight: "500",
    paddingLeft: 0,
    fontSize: 12,
    marginLeft: 7,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1D1D20",
    marginBottom: 0,
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#1D1D20",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 5,
    borderBottomColor: "#2B2D2F",
    borderBottomWidth: 1.2,
    // borderBottomRightRadius: 10,
    // borderBottomLeftRadius: 10,
  },
  button: {
    padding: 10,
    marginBottom: 0,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 5,
    color: "white",
    paddingVertical: 20,
    maxWidth: 260,
    paddingHorizontal: 10,
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
    marginBottom: 2,
    alignSelf: "flex-end",
    backgroundColor: "#14999999",
    marginBottom: 15,
    maxWidth: "80%",
  },
  messageContainerLeft: {
    borderRadius: 20,
    marginBottom: 2,
    alignSelf: "flex-start",
    backgroundColor: "#2B2D2F",
    marginBottom: 15,
    maxWidth: "80%",
  },
  messageContainerRightSmallMargin: {
    marginBottom: 5,
  },
  messageContainerLeftSmallMargin: {
    marginBottom: 5,
  },

  message: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2D2F",
    borderRadius: 20,
    paddingHorizontal: 1,
    paddingVertical: 5,
    marginBottom: 20,
    paddingTop: 0,
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 0,
    color: "white",
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 10,
    backgroundColor: "#2B2D2F",
    fontSize: 20,
    paddingTop: 10,
    marginLeft: 15,
  },
});

export default MessagingUI;
