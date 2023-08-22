import React, { useEffect, useState } from "react";
import {
  Image,
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Animated,
  Alert,
} from "react-native";

import { AntDesign } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { picURL } from "../auth/supabase.js";
import { gestureHandlerRootHOC } from "react-native-gesture-handler"; //install
import { Swipeable } from "react-native-gesture-handler";
import { supabase } from "../auth/supabase.js";
import { useIsFocused } from "@react-navigation/native";

const ContactsUI = ({ route }) => {
  const { session } = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isFocused = useIsFocused();

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

    const filteredUsers = users.filter((user) => {
    const nameMatch = user.joinedGroups
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const fetchUsers = async () => {
    const { data: users, error } = await supabase
    .from("Group Chats")
    .select("*")
    .contains("User_ID", [session.user.id]);

  if (error) {
    console.error(error);
    return;
  }

  const { data, error: sessionError } = await supabase
    .from("UGC")
    .select("name")
    .eq("user_id", session.user.id)
    .single();

  if (sessionError) {
    console.error(sessionError);
    return;
  }

  const sessionusername = data.name;

  const modifiedUsers = await Promise.all(users.map(async (user) => {
    const groupNames = user.Group_Name.split(",").map((name) => name.trim());
    const filteredGroupNames = groupNames.filter(
      (name) => name !== sessionusername
    );
    const joinedGroups = filteredGroupNames.join(", ");

    // Fetch the most recent group chat message
    const { data: recentMessageData, error: messageError } = await supabase
      .from("Group Chat Messages")
      .select("*")
      .eq("Group_ID_Sent_To", user.Group_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (messageError) {
      //console.error(messageError);
      return { ...user, joinedGroups, recentMessage: null };
    }

    return {
      ...user,
      joinedGroups,
      recentMessage: recentMessageData,
    };
  }));
  
  modifiedUsers.sort((a, b) => {
    if (!a.recentMessage) return 1; // Move contacts with no recent message to the end
    if (!b.recentMessage) return -1; // Move contacts with no recent message to the end
    return new Date(b.recentMessage.created_at) - new Date(a.recentMessage.created_at);
  });

  setUsers(modifiedUsers);
};

  const formatRecentTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const currentTime = new Date();
    const diffInMs = currentTime - date;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      // Less than a day ago, display time in AM/PM format
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedTime = `${hours % 12 || 12}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
      return formattedTime;
    } else {
      // More than a day ago, display the full date
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const formattedDate = `${month.toString().padStart(2, "0")}/${day
        .toString()
        .padStart(2, "0")}/${year}`;
      return formattedDate;
    }
  };

  useEffect(() => {
    fetchUsers();
    if (isFocused) {
      fetchUsers();
    }
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "Group Chats" /*filter: `.or(Sent_From.eq.${session.user.id}, Contact_ID.eq.${session.user.id})`, */,
        },
        (payload) => {
          fetchUsers();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isFocused]);

  const handleUserCardPress = (user) => {
    setSelectedUser(user);
    //console.log(user.joinedGroups);

    navigation.navigate("Message", {user});
  };

  const handlePlusIconPress = () => {
    // Implement the logic when the plus icon is pressed
    // For example, you can navigate to the compose message screen
    navigation.navigate("ComposeMessage");
  };

  const renderContact = ({ item }) => {
    const handleDelete = async () => {
      try {
        const { error } = await supabase
          .from("Group Chat Messages")
          .delete()
          .eq("Group_ID_Sent_To", item.Group_ID);
    
        if (error) {
          console.error(error);
          return;
        }
    
        // Now delete from the "Group Chats" table
        const { error: groupChatsError } = await supabase
          .from("Group Chats")
          .delete()
          .eq("Group_ID", item.Group_ID);
    
        if (groupChatsError) {
          console.error(groupChatsError);
        }
    
        // Fetch users again to update the UI
        fetchUsers();
      } catch (error) {
        console.error(error);
      }
    };

    const renderRightActions = (progress, dragX) => {
      // console.log("Progress:", progress);
      const trans = dragX.interpolate({
        inputRange: [-75, 0],
        outputRange: [0, 75], // Modify this line to change the direction of the expansion
      });

      const handleDeleteConfirmation = () => {
        Alert.alert(
          "Delete Contact",
          "Are you sure you want to delete this contact? This will permanently delete all messages for both you and the recipient.",
          [
            {
              text: "Yes",
              onPress: handleDelete,
            },
            {
              text: "No",
            },
          ]
        );
      };
      return (
        <TouchableOpacity onPress={handleDeleteConfirmation}>
          <Animated.View
            style={{
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
              width: 75,
              height: "100%",
              transform: [{ translateX: trans }],
            }}
          >
            {/* Replace 'Delete' text with trashcan icon */}
            <Icon name="trash" size={24} color="white" />
          </Animated.View>
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false} // Disable the bounce effect
        useNativeDriver={true} // Use native driver to prevent bounce effect
      >
           <TouchableOpacity onPress={() => handleUserCardPress(item)}>
        <View style={styles.contactItem}>
          <Image
            style={styles.profilePicture}
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Andrew_Tate_on_%27Anything_Goes_With_James_English%27_in_2021.jpg"  // Use the actual field for the profile picture},
            }}
          />
          <View style={styles.contactInfo}>
            <View style={styles.contactNameContainer}>
              <Text style={styles.contactName}>{item.joinedGroups}</Text>
              {item.recentMessage && item.recentMessage.created_at ? (
                <Text style={styles.MessageTime}>
                  {formatRecentTime(item.recentMessage.created_at)}
                </Text>
              ) : null}
            </View>
            {item.recentMessage ? (
              <Text style={styles.RecentMessage}>
                {item.recentMessage.Message_Content}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
      </Swipeable>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={{
            uri: "https://static.vecteezy.com/system/resources/previews/002/927/317/large_2x/tourist-hammock-for-recreation-portable-hammock-isolated-on-a-white-background-illustration-in-doodle-style-hammock-for-outdoor-recreation-free-vector.jpg",
          }}
        />
        <Text style={styles.headerText}>Messages</Text>
        <TouchableOpacity
          onPress={handlePlusIconPress}
          style={{ position: "absolute", top: 10, right: 13 }}
        >
          <AntDesign name="plus" size={25} color="#159e9e" />
        </TouchableOpacity>
      </View>
      <View style={styles.viewContainer}>
        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={15} color="#575D61" />
          <TextInput
            style={styles.searchInput}
            placeholder=" Search Messages"
            placeholderTextColor="#575D61"
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </View>

        <FlatList
          data={filteredUsers}
          renderItem={renderContact}
          keyExtractor={(item) => item.Group_ID.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    //borderBottomWidth: 1,
    borderColor: "gray",
    paddingTop: 13,
    paddingBottom: 6,
    paddingLeft: 15,
    paddingRight: 15,
    //marginBottom: 8,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: -10,
    color: "white",
  },
  logo: {
    //width: 30,
    //height: 30,
    marginRight: 5,
    marginTop: -10,
  },
  viewContainer: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2D2F",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
    elevation: 3,
    marginHorizontal: 10,
    // borderWidth: 0.20,
    // borderTopWidth: 0.20,
    //borderBottomWidth: 0.2,
    borderColor: "grey",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "white",
    marginLeft: 5,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Align elements at the top of the container
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: "grey",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: "100%", // Set the width to 100% to fill the container
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 400,
    color: "white",
  },
  MessageTime: {
    fontSize: 14,
    fontWeight: "light",
    color: "white", // Add the color for the recent time (optional)
  },
  RecentMessage: {
    fontSize: 14,
    fontWeight: "light",
    color: "#cbcace",
  },
  contactStatus: {
    fontSize: 14,
    color: "#888",
  },
  contactNameContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  rowBack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "red",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  deleteButton: {
    width: 75,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default gestureHandlerRootHOC(ContactsUI);