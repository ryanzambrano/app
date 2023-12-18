import { React, useEffect, useState, useRef, memo } from "react";
import {
  Alert,
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { picURL } from "../auth/supabase";
import { supabase } from "../auth/supabase.js";
import ActionSheet from "react-native-action-sheet";
import ReportUI from "./report.js";
import { promptQuestions } from "../auth/profileUtils.js";
const MAX_IMAGES = 4;

const scrollY = new Animated.Value(0);

const profileZIndex = scrollY.interpolate({
  inputRange: [0, 550],
  outputRange: [1, 0],
  extrapolate: "clamp",
});

const UserCardClone = ({ navigation, route }) => {
  const { session } = route.params;
  /*const {
    name,
    tags,
    bio,
    major,
    user_id,
    for_fun,
    class_year,
    hometown,
    bookmarked_profiles,
    lastModified,
  } = route.params.user;*/

  const { user_id, last_modified } = route.params.user;

  //const { age, gender } = route.params.user.profiles;

  const [living_preferences, setLivingPreference] = useState("");
  const [persons, setPersons] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isFriendAdded, setIsFriendAdded] = useState(false);
  const [isProfileBlocked, setIsProfileBlocked] = useState(false);
  const buttonColor = isFriendAdded ? "#14999999" : "#181d2b";
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isActionSheetVisible, setActionSheetVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usa, setUsa] = useState(null);

  const handleModalClose = () => {
    setSelectedPhotoIndex(null);
  };

  const handleOverlayPress = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(null);
    }
  };

  const handlePhotoPress = (index) => {
    setSelectedPhotoIndex(index);
  };

  const handleQuestionaireButtonPress = () => {
    const currentUser = {
      name,
      tags,
      bio,
      major,
      user_id,
      age,
      gender,
      living_preferences,
      for_fun,
      class_year,
      hometown,
      bookmarked_profiles,
      lastModified,
    };
    navigation.navigate("QuestionaireAnswers", { currentUser });
  };

  /*const {
    name,
    tags,
    bio,
    major,
    user_id,
    for_fun,
    class_year,
    hometown,
    bookmarked_profiles,
    lastModified,
  } = route.params.user;*/
  useEffect(() => {
    fetchUser();
    getProfilePictures();
  }, [user_id, picURL]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      // Fetch data from UGC table

      const { data: ugcData, error: ugcError } = await supabase
        .from("UGC")
        .select("*")
        .eq("user_id", user_id)
        .single(); // Assuming you're fetching data for a single user

      if (ugcError) {
        console.error("Error fetching UGC data:", ugcError);
        return;
      }

      // Fetch data from profile table
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user_id)
        .single(); // Assuming you're fetching data for a single user

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        return;
      }

      // Combine UGC and profile data into a structured object
      const user = {
        ...ugcData,
        ...profileData,
      };

      // Destructure to extract the data into variables
      const { name, tags, bio, major, for_fun, class_year, hometown } = user;

      // Use the variables as needed
      console.log(name, tags, bio, major, for_fun, class_year, hometown);
      //alert(name + ": " + tags + " " + bio + " " + major + " " + class_year);
      //return;

      setUsa(user);

      //return user;
    } catch (error) {
      console.error("Unexpected error in fetchUser:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProfilePictures = async () => {
    try {
      let lastModifiedList = [];

      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("user_id", user_id);

      if (error) {
        alert(error.message);
      }

      if (data) {
        data.forEach((item) => {
          lastModifiedList[item.image_index] = item.last_modified;
        });
      }

      let newPhotos = [];

      if (data.length < 1) {
        //newPhotos = lastModifiedList;
        setPhotos([lastModified]);
        return;
      }
      for (let i = 0; i < MAX_IMAGES; i++) {
        const profilePictureURL = `${picURL}/${user_id}/${user_id}-${i}-${lastModifiedList[i]}`;
        const response = await fetch(profilePictureURL);
        if (response.ok) {
          newPhotos.push(profilePictureURL);
        }
      }
      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchBookmarkedProfiles = async () => {
      const userId = session.user.id;
      try {
        const { data, error } = await supabase
          .from("UGC")
          .select("bookmarked_profiles")
          .eq("user_id", userId);
        if (error) {
          console.error("Error fetching bookmarked_profiles:", error.message);
          return;
        }
        const { bookmarked_profiles } = data[0];
        if (bookmarked_profiles.includes(user_id)) {
          setIsFriendAdded(true);
        } else {
          setIsFriendAdded(false);
        }
      } catch (error) {
        console.error("Error fetching bookmarked_profiles:", error.message);
      }
    };
    const fetchPrompts = async () => {
      const { data: promptsData, error: promptsError } = await supabase
        .from("prompts")
        .select("*")
        .eq("user_id", user_id);
      if (promptsData) {
        const answeredPrompts = Object.entries(promptsData[0])
          .filter(
            ([prompt, answer]) =>
              answer !== null && prompt !== "id" && prompt !== "user_id"
          )
          .map(([prompt, answer]) => ({ prompt, answer }));

        setPrompts(answeredPrompts);
      } else {
        console.log("Error fetching prompts: ", promptsError);
      }
    };

    fetchBookmarkedProfiles();
    fetchPrompts();
  }, []);

  const handleBlockUser = async (user_id) => {
    Alert.alert("Block User", "Are you sure you want to block this user?", [
      {
        text: "Exit",
        style: "cancel",
      },
      {
        text: "Block User",
        style: "cancel",
        onPress: async () => await actuallyBlockUser(user_id),
      },
    ]);
  };

  const actuallyBlockUser = async (user_id) => {
    console.log("blocking");
    const userId = session.user.id;
    try {
      const { data, error } = await supabase
        .from("UGC")
        .select("blocked_profiles")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching blocked_profiles:", error.message);
        return;
      }

      const { blocked_profiles } = data[0];
      if (!blocked_profiles.includes(user_id)) {
        const updatedBlockedProfiles = [...blocked_profiles, user_id];
        const { data: updateData, error: updateError } = await supabase
          .from("UGC")
          .update({ blocked_profiles: updatedBlockedProfiles })
          .eq("user_id", userId);

        if (updateError) {
          console.error(
            "Error updating blocked_profiles:",
            updateError.message
          );
        } else {
          setIsProfileBlocked(true);
        }
      }
    } catch (error) {
      console.error("Error blocking profile:", error.message);
    }
    navigation.goBack();
  };

  const handleAddFriend = async (user_id) => {
    setIsFriendAdded((prevState) => !prevState);
    const userId = session.user.id;
    try {
      const { data, error } = await supabase
        .from("UGC")
        .select("bookmarked_profiles")
        .eq("user_id", userId);
      if (error) {
        console.error("Error fetching bookmarked_profiles:", error.message);
        return;
      }
      const { bookmarked_profiles } = data[0];
      if (!bookmarked_profiles.includes(user_id)) {
        const updatedBookmarkedProfiles = [...bookmarked_profiles, user_id];
        const { data: updateData, error: updateError } = await supabase
          .from("UGC")
          .update({ bookmarked_profiles: updatedBookmarkedProfiles })
          .eq("user_id", userId);
        if (updateError) {
          console.error(
            "Error updating bookmarked_profiles:",
            updateError.message
          );
        } else {
          setIsFriendAdded(true);
        }
      } else {
        const updatedBookmarkedProfiles = bookmarked_profiles.filter(
          (id) => id !== user_id
        );
        const { data: updateData, error: updateError } = await supabase
          .from("UGC")
          .update({ bookmarked_profiles: updatedBookmarkedProfiles })
          .eq("user_id", userId);

        if (updateError) {
          console.error(
            "Error updating bookmarked_profiles:",
            updateError.message
          );
        } else {
          setIsFriendAdded(false);
        }
      }
    } catch (error) {
      console.error("Error adding/removing bookmark:", error.message);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const showActionSheet = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        options: ["Cancel", "Block User", "Report User"],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 1,
        tintColor: "white", // Set a default text color for all buttons
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          handleBlockUser(user_id);
        } else if (buttonIndex === 2) {
          navigation.navigate("ReportUI", { user_id: user_id });
        }
      }
    );
  };

  useEffect(() => {
    if (isActionSheetVisible) {
      showActionSheet();
      setActionSheetVisible(false);
    }
  }, [isActionSheetVisible]);

  const handleUserCardPress = async () => {
    {
      let Imagedata = [
        {
          last_modified: lastModified,
          user_id: user_id,
          image_index: 0,
        },
      ];

      const combinedIDs = [session.user.id, user_id];
      const Finalarray = combinedIDs.slice().sort();

      const { data: insertData, error: insertError } = await supabase
        .from("Group_Chats")
        .insert([
          {
            User_ID: Finalarray,
            Ammount_Users: Finalarray.length,
          },
        ])
        .select();

      if (insertError) {
        if (insertError.code === "23505") {
          // dupe error
          const { data: navigationdata, error: navigationError } =
            await supabase
              .from("Group_Chats")
              .select("*")
              .contains("User_ID", Finalarray)
              .eq("Ammount_Users", Finalarray.length);

          const { data: recentMessageData, error: messageError } =
            await supabase
              .from("Group_Chat_Messages")
              .select(`*, UGC (name)`)
              .eq("Group_ID_Sent_To", navigationdata[0].Group_ID)
              .order("created_at", { ascending: false })
              .limit(150);

          let chatmessages = recentMessageData;

          if (recentMessageData != undefined) {
            if (recentMessageData.length < 17) {
              chatmessages = [...recentMessageData].reverse();
            }
          }

          if (navigationError) {
            console.log(navigationError);
            alert("Something went wrong, please try again later");
            return;
          } else {
            //console.log(navigationdata);
            const fetchedPersons = navigationdata.map((person) => ({
              ...person,
              images: Imagedata,
              joinedGroups: name,
              recentMessage: recentMessageData[0],
              messages: chatmessages,
            }));

            setPersons(fetchedPersons);
            if (fetchedPersons.length > 0) {
              navigation.navigate("Message", { user: fetchedPersons[0] });
            }

            return;
          }
        } else {
          alert("Failed to insert.");
        }
        return;
      }
      const fetchedPersons = insertData.map((person) => ({
        ...person,
        images: Imagedata,
        joinedGroups: name,
        messages: undefined,
        recentMessage: undefined,
      }));
      setPersons(fetchedPersons);
      if (fetchedPersons.length > 0) {
        navigation.navigate("Message", { user: fetchedPersons[0] });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        // Render loading indicator when isLoading is true
        <View
          style={{ alignSelf: "center", justifyContent: "center", flex: 1 }}
        >
          <ActivityIndicator size="large" color="#fff" />
          {/* You can also use any custom loading component here */}
        </View>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Animated.View
            style={{
              zIndex: profileZIndex,
            }}
          >
            <View style={styles.header}>
              <Text style={styles.name}>{usa.name}</Text>
              <View style={styles.backButton}></View>
              <TouchableOpacity
                onPress={() => setActionSheetVisible(true)}
                style={styles.blockButton}
              >
                <AntDesign name="deleteuser" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>
          <Animated.View
            style={{
              ...styles.profileContainer,
              zIndex: profileZIndex,
            }}
          >
            <ScrollView
              horizontal
              style={styles.photoContainer}
              pagingEnabled={true}
            >
              {photos.map((photo, index) => (
                <TouchableWithoutFeedback key={index}>
                  <View key={index}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </ScrollView>
            <Modal
              visible={selectedPhotoIndex !== null}
              transparent={true}
              onRequestClose={handleModalClose}
            >
              <TouchableWithoutFeedback onPress={handleOverlayPress}>
                <View style={styles.modalContainer}>
                  <Image
                    source={{ uri: photos[selectedPhotoIndex] }}
                    style={styles.fullPhoto}
                  />
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </Animated.View>
          <ScrollView
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            bounces={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.tab}>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.friendButton,
                    { backgroundColor: buttonColor },
                  ]}
                  onPress={() => handleAddFriend(user_id)}
                >
                  <Text style={styles.friendButtonText}>
                    {isFriendAdded ? "Bookmarked! ✓" : "+ Bookmark"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={handleUserCardPress}
                >
                  <Text style={styles.chatButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.questionaireButtonContainer}
                onPress={() => handleQuestionaireButtonPress()}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 17 }}
                >
                  {" "}
                  View Questionaire Responses
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.roundedContainer,
                  { backgroundColor: "#181d2b" },
                ]}
              >
                <Text style={styles.bioHeader} paddingBottom={15}>
                  Details
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  paddingBottom={20}
                  paddingTop={4}
                  paddingHorizontal={15}
                >
                  {usa.class_year && (
                    <View style={styles.infoContainer}>
                      <Entypo name="graduation-cap" size={22} color="white" />
                      <Text style={styles.detailsText}> {usa.class_year}</Text>
                      <View style={styles.verticalDivider} />
                    </View>
                  )}

                  {usa.age && (
                    <View style={styles.infoContainer}>
                      <MaterialIcons name="cake" size={22} color="white" />
                      <Text style={styles.detailsText}>{usa.age}</Text>
                      <View style={styles.verticalDivider} />
                    </View>
                  )}
                  {usa.gender && (
                    <View style={styles.infoContainer}>
                      <Ionicons
                        name="md-person-sharp"
                        size={22}
                        color="white"
                      />
                      <Text style={styles.detailsText}>{usa.gender}</Text>
                    </View>
                  )}
                  {usa.major && (
                    <View style={styles.infoContainer}>
                      <View style={styles.verticalDivider2} />
                      <Entypo name="open-book" size={22} color="white" />
                      <Text style={styles.detailsText}> {usa.major}</Text>
                    </View>
                  )}
                  {!usa.hometown && (
                    <View style={styles.infoContainer} paddingRight={33}></View>
                  )}
                  {usa.hometown && (
                    <View style={styles.infoContainer} paddingRight={35}>
                      <View style={styles.verticalDivider2} />
                      <MaterialIcons
                        name="home-filled"
                        marginLeft={-2}
                        size={26}
                        color="white"
                      />
                      <Text style={styles.detailsText}>{usa.hometown}</Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              {usa.bio && (
                <View style={styles.roundedContainer}>
                  <View style={styles.bio}>
                    <View>
                      <Text style={styles.bioHeader}>About {usa.name}</Text>
                      <Text style={styles.bioText}>{usa.bio}</Text>
                    </View>
                  </View>
                </View>
              )}

              {prompts.some((item) => item.answer) && (
                <View style={styles.roundedContainer}>
                  {prompts.some((item) => item.answer) && (
                    <Text style={styles.bioHeader}>Additional Info</Text>
                  )}
                  <ScrollView
                    horizontal
                    style={styles.horizontalScrollView}
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                  >
                    {prompts.map((item, index) =>
                      item.answer ? (
                        <View key={index} style={styles.itemContainer}>
                          <Text style={styles.itemPrompt}>
                            {promptQuestions[item.prompt]}
                          </Text>
                          <Text style={styles.itemAnswer}>{item.answer}</Text>
                        </View>
                      ) : null
                    )}
                  </ScrollView>
                </View>
              )}
              <View style={styles.roundedContainer}>
                <Text style={styles.bioHeader}>Interests</Text>
                <View style={styles.tagsContainer} marginBottom={25}>
                  {usa.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginHorizontal: 0,
    backgroundColor: "#1D1D20",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
    marginTop: -80,
    paddingTop: 80,
    backgroundColor: "#1D1D20",
    justifyContent: "center",
    paddingVertical: 15,
  },

  backButton: {
    position: "absolute",
    left: 0,
    paddingTop: 45,
    marginRight: 15,
    paddingLeft: 15,
    zIndex: 10000000,
  },
  blockButton: {
    position: "absolute",
    right: 0,
    paddingTop: 70,
    paddingRight: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  questionaireButtonContainer: {
    flex: 1,
    marginHorizontal: 13,
    marginTop: 4,
    backgroundColor: "#14999999", //#2B2D2F
    paddingVertical: 12,
    borderRadius: 12,
    //marginBottom: 10,
    borderWidth: 0.4,
    alignItems: "center",
    marginBottom: 15,
  },
  scrollView: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    //zIndex: 1,
  },
  scrollViewContent: {
    paddingTop: 550,
    //marginTop: 550,
    //zIndex: 1,
  },

  backButtonText: {
    fontSize: 30,
    color: "#149999",

    zIndex: 10000000,
  },

  photoContainer: {
    height: 440,
    marginLeft: 6,
    width: Dimensions.get("window").width - 12,
    marginBottom: 5,
    marginTop: -5,
    marginHorizontal: 0,
    borderRadius: 15,
    borderWidth: 0.7,
    zIndex: 1,
    // borderColor: "grey",
  },
  photo: {
    width: Dimensions.get("window").width - 12,
    height: 440,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  tab: {
    backgroundColor: "#111111",
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    marginTop: -10,
    //shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 4.84,
    zIndex: 2,
    paddingBottom: 20,
  },
  fullPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 3,
  },
  friendButton: {
    borderRadius: 12,
    padding: 13,
    alignItems: "center",
    marginBottom: 10,
    width: Dimensions.get("window").width * 0.55,
    marginRight: 3,
    borderWidth: 0.4,
    marginLeft: 10,
    // borderColor: "grey",
  },
  friendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatButton: {
    backgroundColor: "#181d2b",
    borderRadius: 12,
    marginRight: 10,
    padding: 13,
    alignItems: "center",
    marginBottom: 10,
    width: Dimensions.get("window").width * 0.36,
    borderWidth: 0.4,
    //borderColor: "grey",
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#363659",
    borderRadius: 15,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
    flexDirection: "row",
    borderWidth: 0.4,
  },
  bio: {
    fontSize: 18,
    fontWeight: "600",
    paddingBottom: 25,
    paddingTop: 5,
  },
  bioHeader: {
    alignSelf: "center",
    fontWeight: "600",
    paddingBottom: 20,
    marginTop: 20,
    marginBottom: 5,
    fontSize: 20,
    color: "white",
  },
  bioText: {
    fontSize: 16,
    marginLeft: 25,
    marginRight: 25,
    color: "white",
  },
  detailsText: {
    color: "white",
    fontSize: 16,
    textAlign: "justify",
  },
  details: {
    alignItems: "left",
    justifyContent: "center",
    gap: 23,
  },

  major: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    gap: 10,
    justifyContent: "left",
  },
  icons: {
    alignContent: "center",
    alignItems: "center",
    gap: 17,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 10, // Space on the left side of the row
    paddingRight: 20,
  },
  leftColumn: {
    flexDirection: "column",
    gap: 5,
  },
  rightColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },
  iconAndText: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailsText: {
    marginLeft: 10,
    color: "white",
    fontSize: 16,
  },
  tagsContainer: {
    backgroundColor: "#181d2b",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 25,
    marginTop: -2,
    marginBottom: 0,
    borderRadius: 15,
    justifyContent: "center",
    // borderWidth: 0.4,
    //borderColor: "grey",
    marginRight: 10,
    marginLeft: 10,
  },
  tag: {
    backgroundColor: "#14999999",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
    //borderWidth: 1,
    borderColor: "white",
  },
  tagText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },

  itemContainer: {
    marginHorizontal: 15,
    backgroundColor: "#2c3c4f",
    //borderWidth: 0.5,
    //borderColor: "lightgrey",
    borderRadius: 50,
    padding: 30,
    width: 300,
    marginBottom: 25,
    minWidth: 150,
    gap: 10,
  },
  itemPrompt: {
    fontSize: 15,
    color: "white",
    marginBottom: 5,
  },
  itemAnswer: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },
  horizontalInfoScrollView: {
    marginBottom: 10,
    backgroundColor: "#1D1D20",
    borderRadius: 15,
    flexDirection: "row",
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 0.4,
    marginRight: 10,
    marginLeft: 10,
  },

  infoContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    flexDirection: "row",
    backgroundColor: "#181d2b",
  },

  verticalDivider: {
    width: 0.3,
    backgroundColor: "grey",
    height: "100%",
    alignSelf: "center",
    marginLeft: 20,
    marginRight: 10,
  },
  verticalDivider2: {
    width: 0.3,
    backgroundColor: "grey",
    height: "100%",
    alignSelf: "center",
    marginLeft: 9,
    marginRight: 20,
  },
  profileDetails: {
    flex: 1,
    padding: 16,
    paddingVertical: 20,
    paddingTop: 0,
    gap: 10,
    marginBottom: -5,
  },

  roundedContainer: {
    backgroundColor: "#181d2b",
    borderRadius: 20,
    padding: 0,
    marginBottom: 15,
    marginHorizontal: 15,
  },
});

export default UserCardClone;
