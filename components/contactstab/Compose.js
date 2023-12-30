import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  LayoutAnimation,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import Feather icons
import { supabase } from "../auth/supabase";
import { picURL } from "../auth/supabase.js";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";

const isBookmarkedColor = "#14999999";
const notBookmarkedColor = "#fff";

const ComposeMessageScreen = ({ route }) => {
  const [selectedUserCount, setSelectedUserCount] = useState(0);
  const [persons, setPersons] = useState([]);
  const navigation = useNavigation();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { session } = route.params;
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [blockedProfiles, setBlockedProfiles] = useState([]);
  const [usersBlockingMe, setUsersBlockingMe] = useState([]);
  const [sessionusername, setSessionUsername] = useState(""); // Initialize sessionusername state
  const [sessionWho, setSessionWho] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState([]);

  const toggleBookmarkButton = () => {
    setIsBookmarked((prevIsBookmarked) => !prevIsBookmarked);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No users found</Text>
    </View>
  );

  useEffect(() => {
    fetchUsers();
    fetchSessionWho();
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

  const fetchSessionWho = async () => {
    const { data, error } = await supabase
      .from("profile")
      .select("who")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setSessionWho(data.who);
  };

  const fetchUsers = async () => {
    const { data: sessionProfile, error: sessionProfileError } = await supabase
      .from("profile")
      .select("college")
      .eq("user_id", session.user.id)
      .single();

    if (sessionProfileError) {
      console.error("Error fetching session user's profile:", sessionProfileError.message);
      return;
    }

    const sessionUserCollege = sessionProfile.college;

    const { data: collegeProfiles, error: collegeProfilesError } = await supabase
      .from("profile")
      .select("user_id")
      .eq("college", sessionUserCollege)
      .neq("profile_complete", false);

    if (collegeProfilesError) {
      console.error("Error fetching profiles:", collegeProfilesError.message);
      return;
    }

    const userIds = collegeProfiles.map(profile => profile.user_id);

    const { data: users, error } = await supabase
      .from("UGC")
      .select("*")
      .in("user_id", userIds)
      .neq("has_ugc", false)
      .neq("profile_viewable", false)
      .neq("user_id", session.user.id);

    if (error) {
      console.error(error);
      return;
    }

    const modifiedUsers = await Promise.all(
      users.map(async (user) => {
        const { data: Imagedata, error: ImageError } = await supabase
          .from("images")
          .select("last_modified, user_id")
          .eq("user_id", user.user_id)
          .eq("image_index", 0)
          .single();
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("gender")
          .eq("user_id", user.user_id)
          .single();

        let gender = profileData ? profileData.gender : null;

        if (ImageError) {
          return {
            ...user,
            image:
              "data:image/png;base64,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",
            gender,
          };
        }
        if (Imagedata) {
          return {
            ...user,
            image: `${picURL}/${Imagedata.user_id}/${Imagedata.user_id}-0-${Imagedata.last_modified}`,
            gender,
          };
        }
      })
    );

    const usersWithProfilePictures = modifiedUsers.filter((user) => {
      return (
        user.image !==
        "data:image/png;base64,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"
      );
    });

    const { data: bookmarkedData, error: bookmarkedError } = await supabase
      .from("UGC")
      .select("bookmarked_profiles")
      .eq("user_id", session.user.id);
    if (bookmarkedError) {
      console.error(
        "Error fetching bookmarked profiles:",
        bookmarkedError.message
      );
    } else {
      const { bookmarked_profiles } = bookmarkedData[0];
      setBookmarkedProfiles(bookmarked_profiles);
    }

    const { data: allBlockedProfilesData, error: allBlockedProfilesError } =
      await supabase.from("UGC").select("user_id, blocked_profiles");
    if (allBlockedProfilesError) {
      console.error(
        "Error fetching all blocked profiles:",
        allBlockedProfilesError.message
      );
    } else {
      const usersWhoBlockedMe = allBlockedProfilesData
        .filter(
          (user) =>
            Array.isArray(user.blocked_profiles) &&
            user.blocked_profiles.includes(session.user.id)
        )
        .map((user) => user.user_id);
      //(usersWhoBlockedMe);
      setUsersBlockingMe(usersWhoBlockedMe);
    }

    const { data: blockedData, error: blockedError } = await supabase
      .from("UGC")
      .select("blocked_profiles")
      .eq("user_id", session.user.id);
    if (blockedError) {
      console.error("Error fetching blocked profiles:", blockedError.message);
    } else {
      const { blocked_profiles } = blockedData[0];
      setBlockedProfiles(blocked_profiles);
    }
    setUsers(usersWithProfilePictures);
  };

  
  const handleUserCardPress = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(
        selectedUsers.filter((selectedUser) => selectedUser !== user)
      );
      setSelectedUserCount(selectedUserCount - 1);
    } else {
      if (selectedUserCount < 5) {
        setSelectedUsers([...selectedUsers, user]);
        setSelectedUserCount(selectedUserCount + 1);
      }
    }

    // Toggle user label visibility with LayoutAnimation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  
  const handleCreateMessage = async () => {
    try {
      const selectedUserNames = selectedUsers.map((user) => user.name);
      const nnnn = selectedUserNames.sort();
      const nameparam = nnnn.join(", ");
      selectedUserNames.push(sessionusername);
      selectedUserNames.sort();
      const usernames = selectedUserNames.join(", ");

      // Get the IDs of the selected users
      const ids = selectedUsers.map((user) => user.user_id);
      const selectedUserIDs = selectedUsers.map((user) => user.user_id);
      selectedUserIDs.push(session.user.id);
      selectedUserIDs.sort();

      // Insert the new record with User_ID, Group_ID, and Group_Name
      const { data: insertData, error: insertError } = await supabase
        .from("Group_Chats")
        .insert([
          {
            User_ID: selectedUserIDs, // Join selected user names with commas
            Ammount_Users: selectedUserIDs.length,
            Host: session.user.id,
          },
        ])
        .select();
        const { data: YourName, error } = await supabase
        .from("UGC")
        .select("name")
        .eq("user_id", session.user.id)
        .single();
  
      if (insertData) {
        const { data: Imagedata, error: ImageError } = await supabase
          .from("images")
          .select("*")
          .in("user_id", ids)
          .eq("image_index", 0);
        const fetchedPersons = insertData.map((person) => ({
          ...person,
          images: Imagedata,
          joinedGroups: nameparam,
          MyName: YourName
        }));
        setPersons(fetchedPersons);
        if (fetchedPersons.length > 0) {
          navigation.replace("Message", {
            user: fetchedPersons[0],
          });
        }
      }

      if (insertError) {
        //alert(insertError.message);
        if (insertError.code === "23505") {
          const { data: navigationdata, error: navigationError } =
            await supabase
              .from("Group_Chats")
              .select("*")
              .contains("User_ID", selectedUserIDs)
              .eq("Ammount_Users", selectedUserIDs.length);

          const { data: recentMessageData, error: messageError } =
            await supabase
              .from("Group_Chat_Messages")
              .select(`*`)
              .eq("Group_ID_Sent_To", navigationdata[0].Group_ID)
              .order("created_at", { ascending: false })
              .limit(100);

          let chatmessages = recentMessageData;

          if (recentMessageData != undefined) {
            if (recentMessageData.length < 17) {
              chatmessages = [...recentMessageData].reverse();
            }
          }

          const { data: Imagedata, error: ImageError } = await supabase
            .from("images")
            .select("*")
            .in("user_id", ids)
            .eq("image_index", 0);

          //console.log(Imagedata);
          if (navigationError) {
            console.log(navigationError);
            return;
          } else {
            let fetchedPersons;
            //console.log(navigationdata[0].Group_Name);
            if (!navigationdata[0].Group_Name) {
              console.log("Group Name does not exist");
              fetchedPersons = navigationdata.map((person) => ({
                ...person,
                images: Imagedata,
                joinedGroups: nameparam,
                recentMessage: recentMessageData[recentMessageData.length - 1],
                messages: chatmessages,
                MyName: YourName
              }));
            } else {
              console.log("Group Name exist");
              fetchedPersons = navigationdata.map((person) => ({
                ...person,
                images: Imagedata,
                joinedGroups: navigationdata[0].Group_Name,
                recentMessage: recentMessageData[recentMessageData.length - 1],
                messages: chatmessages,
                MyName: YourName
              }));
            }

            setPersons(fetchedPersons);
            if (fetchedPersons.length > 0) {
              navigation.replace("Message", {
                user: fetchedPersons[0]
              });
            }

            return;
          }
          // The duplicate key violation occurred, no need to handle the conflicting row
        } else {
          alert("Something went wrong, please try again later");
          // Handle other insert errors
        }
        return;
      }

      // Log the Group_ID
    } catch (err) {
      console.error("An error occurred:", err);
    }
  };

  const selectedUserNames = selectedUsers.map((user) => user.name).join(" ");
  const isNamesSelected = selectedUserNames.length > 0;

  const createButtonLabel =
    selectedUsers.length <= 1 ? "Create Message" : "Create Group Chat";

  const sortedUsers = [...users].sort((a, b) => {
    if (a.gender === sessionWho) return -1;
    if (b.gender === sessionWho) return 1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter((user) => {
    const isBlocked = blockedProfiles.includes(user.user_id);
    const isBlockingMe = usersBlockingMe.includes(user.user_id);

    if (isBlocked || isBlockingMe) {
      return false;
    }
    const nameMatch = user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (isBookmarked) {
      return bookmarkedProfiles.includes(user.user_id) && nameMatch;
    }
    return nameMatch;
  });

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        handleUserCardPress(item);
        setSearchQuery("");
      }}
      disabled={selectedUserCount >= 6 && !selectedUsers.includes(item)}
    >
      <View style={styles.contactItem}>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profilePicture}
            source={{
              uri: item.image,
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
        <View style={styles.swipeIndicator}></View>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#159e9e" />
          </TouchableOpacity>
          <Text style={styles.composeHeader}>{"Compose Message"}</Text>
          <TouchableOpacity
            onPress={toggleBookmarkButton}
            style={styles.buttonContainer}
          >
            <Icon
              name="bookmark"
              size={30}
              color={isBookmarked ? isBookmarkedColor : notBookmarkedColor}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.toInputContainer}>
        <View style={styles.toLabelContainer}>
          <Text style={styles.toLabel}>To:</Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedUserContainer}
          >
            {selectedUsers.map((user) => (
              <View key={user.id} style={styles.selectedUser}>
                <Text style={styles.selectedUserName}>{user.name}</Text>
              </View>
            ))}
          </ScrollView>
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
        ListEmptyComponent={renderEmptyComponent}
      />
      <View style={styles.createButtonContainer}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: isButtonDisabled ? "#999" : "#14999999" },
            ]}
            onPress={handleCreateMessage}
            disabled={isButtonDisabled}
          >
            <Text style={styles.createButtonText}>{createButtonLabel}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.counterText}>{selectedUserCount}/5</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  createButtonContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center the items horizontally
    alignItems: "center",
    marginLeft: 45,
    marginHorizontal: 16, // Adjust margin as needed
    marginBottom: 16, // Adjust margin as needed
  },

  // Style for the counter text
  counterText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1.2,
    borderBottomColor: "#2B2D2F",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
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
    marginBottom: 35,
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
    paddingRight: 20,
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
    backgroundColor: "#1D1D20",
    borderRadius: 0,
    paddingHorizontal: 10,
    marginTop: -5,
    paddingVertical: 10,
    marginBottom: 5,
    borderBottomColor: "grey",
    borderBottomWidth: 0.2,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  toLabel: {
    fontSize: 16,
    marginRight: 5,
    color: "grey",
  },
  toInput: {
    flex: 1,
    height: 40,
    color: "white",
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
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    backgroundColor: "#1D1D20",
    paddingTop: Platform.OS === "ios" ? -50 : 0,
    paddingBottom: Platform.OS === "ios" ? -25 : 0,
    marginBottom: 5,
    borderBottomColor: "grey",
    borderBottomWidth: 0.2,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  composeHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    // adjust or remove paddingRight as needed
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
  swipeIndicator: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "grey",
    marginTop: 25,
    marginBottom: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 140,
  },
  emptyText: {
    fontSize: 20,
    color: "grey",
  },
});
export default ComposeMessageScreen;
