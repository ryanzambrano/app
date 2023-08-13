import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  LayoutAnimation,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons"; // Import Feather icons
import { supabase } from "../auth/supabase";
import { picURL } from "../auth/supabase.js";
import { v4 as uuidv4 } from "react-native-uuid-generator";

const ComposeMessageScreen = ({ route }) => {
  const navigation = useNavigation();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { session } = route.params;
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionusername, setSessionUsername] = useState(""); // Initialize sessionusername state

  useEffect(() => {
    fetchUsers();
    fetchSessionUsername();
  }, []);

  useEffect(() => {
    // Check if there are any selected users
    if (selectedUsers.length > 0) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [selectedUsers]);

  const fetchSessionUsername = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .select("name")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setSessionUsername(data.name);
  };

  const fetchUsers = async () => {
    const { data: users, error } = await supabase.from("UGC").select("*");
    if (error) {
      console.error(error);
      return;
    }

    // Filter out the current user using session.user.id
    const filteredUsers = users.filter(
      (user) => user.user_id !== session.user.id
    );

    setUsers(filteredUsers);
  };

  const handleUserCardPress = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(
        selectedUsers.filter((selectedUser) => selectedUser !== user)
      );
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }

    // Toggle user label visibility with LayoutAnimation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };
  const handleCreateMessage = async () => {
    try {
      const selectedUserNames = selectedUsers.map((user) => user.name);
      selectedUserNames.push(sessionusername);
      selectedUserNames.sort();
  
      // Get the IDs of the selected users
      const selectedUserIDs = selectedUsers.map((user) => user.user_id);
      selectedUserIDs.push(session.user.id);
      selectedUserIDs.sort();

  
      // Insert the new record with User_ID, Group_ID, and Group_Name
      const { data: insertData, error: insertError } = await supabase
        .from("Group Chats")
        .insert([
          {
            User_ID: selectedUserIDs,
            Group_Name: selectedUserNames, // Join selected user names with commas
            Ammount_Users: selectedUserIDs.length,
          },
        ])
        .select();
  
        if (insertError) {
          if (insertError.code === "23505") {
            /*console.log(selectedUserIDs);
            const { data, error } = await supabase
            .from("Group Chats") // Check that the table name is correct and matches your database
            .select('*')
            .eq("User_ID", selectedUserIDs); // Make sure selectedUserIDs is defined and contains valid data
            console.log(data);
            console.log(error);*/
            alert('A group chat/Message already exists for these users.');
            return;
            // The duplicate key violation occurred, no need to handle the conflicting row
          } else {
            alert('Failed to insert.');
            // Handle other insert errors
          }
          return;
        }
  
  
      // Log the Group_ID
    } catch (err) {
      console.error("An error occurred:", err);
    }
    navigation.goBack();
  };

  const selectedUserNames = selectedUsers.map((user) => user.name).join(" ");
  const isNamesSelected = selectedUserNames.length > 0;

  const createButtonLabel =
    selectedUsers.length <= 1 ? "Create Message" : "Create Group Chat";

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserCardPress(item)}>
      <View style={styles.contactItem}>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profilePicture}
            source={{
              uri: `${picURL}/${item.user_id}/${
                item.user_id
              }-0?${new Date().getTime()}`,
            }}
          />
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.contactNameContainer}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.MessageTime}>{item.recentTime}</Text>
          </View>
          <Text style={styles.RecentMessage}>{item.recentMessage}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Feather
            name={selectedUsers.includes(item) ? "check-circle" : "circle"}
            size={24}
            color={selectedUsers.includes(item) ? "green" : "gray"}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.composeHeader}>{"Compose Message"}</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>{"Cancel"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.toInputContainer}>
        <View style={styles.toLabelContainer}>
          <Text style={styles.toLabel}>To:</Text>
          <View style={styles.selectedUserContainer}>
            {selectedUsers.map((user) => (
              <View key={user.id} style={styles.selectedUser}>
                <Text style={styles.selectedUserName}>{user.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.toInput}
            placeholder=""
            placeholderTextColor="#888"
            autoCorrect={false}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredUsers.slice(0, 50)}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
      />

      <TouchableOpacity
        style={[
          styles.createButton,
          { backgroundColor: isButtonDisabled ? "#999" : "#14999999" }, // Apply grey color if disabled
        ]}
        onPress={handleCreateMessage}
        disabled={isButtonDisabled} // Disable the button based on the state
      >
        <Text style={styles.createButtonText}>{createButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    width: "100%",
  },
  selectedUserNamesWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedUser: {
    backgroundColor: "#14999999",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  createButton: {
    marginVertical: 20,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#14999999",
    borderRadius: 10,
  },
  selectedUserName: {
    color: "white",
    fontSize: 14,
  },
  toLabelAndNames: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
  },
  selectedUserContainer: {
    flexDirection: "row", // Align the selected users horizontally
    alignItems: "center", // Vertically center the selected users
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  toLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    height: 30,
  },
  buttonContainer: {
    flex: 1,
    alignItems: "flex-end",
    color: "#14999999",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileContainer: {
    width: 100,
    height: 100,
    borderRadius: 50, // Half of the width and height to create a circular shape
    backgroundColor: "#dedede",
    overflow: "hidden",
    marginRight: 10,
  },
  profilePicture: {
    width: "100%",
    height: "100%",
  },
  contactNameContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  toInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  toLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  toInput: {
    flex: 1,
    height: 40,
    color: "#333",
    fontSize: 15,
    marginRight: 10,
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
    justifyContent: "center",
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#dedede",
    overflow: "hidden",
    marginRight: 5,
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
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "#F9F9F9",
    marginBottom: 5,
  },
  headerSafeArea: {
    backgroundColor: "#e8e8ea",
    paddingTop: Platform.OS === "ios" ? -50 : 0,
    paddingBottom: Platform.OS === "ios" ? -25 : 0,
    marginBottom: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    paddingHorizontal: 100,
    paddingVertical: 10,
    width: "100%",
  },
  composeHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    justifyContent: "center",
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "light",
    color: "blue",
    paddingLeft: 50,
  },
});
export default ComposeMessageScreen;
