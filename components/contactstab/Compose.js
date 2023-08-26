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
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

const ComposeMessageScreen = ({ route }) => {
  const [persons, setPersons] = useState([]);
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
    const { data: users, error } = await supabase
    .from("UGC")
    .select("*")
    .neq("user_id", session.user.id);
    if (error) {
      console.error(error);
      return;
    }

    // Filter out the current user using session.user.id
    //console.log(users[0].name);
    /*const { data: Imagedata, error: ImageError } = await supabase
    .from("images")
    .select('last_modified, user_id')
    .in("user_id", filteredUsers)
    .eq("image_index", 0);*/

    setUsers(users);
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
      const usernames = selectedUserNames.join(", ");

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
            Group_Name: usernames, // Join selected user names with commas
            Ammount_Users: selectedUserIDs.length,
          },
        ])
        .select();

      if (insertError) {
        if (insertError.code === "23505") {
          const { data: navigationdata, error: navigationError } =
            await supabase
              .from("Group Chats")
              .select("*")
              .contains("User_ID", selectedUserIDs)
              .eq("Ammount_Users", selectedUserIDs.length);
          if (navigationError) {
            console.log(navigationError);
            return;
          } else {
            //console.log(navigationdata);
            const fetchedPersons = navigationdata.map((person) => person);
            setPersons(fetchedPersons);
            if (fetchedPersons.length > 0) {
              navigation.navigate("Message", { user: fetchedPersons[0] });
            }

            return;
          }
          // The duplicate key violation occurred, no need to handle the conflicting row
        } else {
          alert("Failed to insert.");
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
              uri: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Andrew_Tate_on_%27Anything_Goes_With_James_English%27_in_2021.jpg",
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
          <FontAwesome
            name={selectedUsers.includes(item) ? "circle" : "circle-o"}
            size={24}
            color="#159e9e"
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#159e9e" />
          </TouchableOpacity>
          <Text style={styles.composeHeader}>{"Compose Message"}</Text>
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
    borderBottomWidth: 0.3,
    borderBottomColor: "grey",
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
    backgroundColor: "#2B2D2F",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  toLabel: {
    fontSize: 16,
    marginRight: 5,
    color: "grey",
  },
  toInput: {
    flex: 1,
    height: 40,
    color: "#2B2D2F",
    fontSize: 15,
    marginRight: 5,
  },
  button: {
    padding: 10,
    marginBottom: 0,
  },
  contactName: {
    fontSize: 18,
    marginLeft: 10,
    paddingVertical: 20,
    justifyContent: "center",
    color: "white",
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
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
    color: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "white",
    fontSize: 20,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "#1D1D20",
  },
  headerSafeArea: {
    backgroundColor: "#2B2D2F",
    paddingTop: Platform.OS === "ios" ? -50 : 0,
    paddingBottom: Platform.OS === "ios" ? -25 : 0,
    marginBottom: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    paddingVertical: 10,
    width: "100%",
    marginLeft: 10,
  },
  composeHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    paddingRight: 120,
    //justifyContent: "center",
  },
  cancelButton: {
    paddingHorizontal: 0,
    paddingVertical: 5,
    borderRadius: 5,
  },
  cancelButtonText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    paddingLeft: 1,
  },
});
export default ComposeMessageScreen;
