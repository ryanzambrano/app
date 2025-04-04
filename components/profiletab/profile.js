import React, { useState, useEffect, useRef } from "react";

import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import ConfettiCannon from "react-native-confetti-cannon";
import { fetchUsername } from "../auth/profileUtils.js";
import { supabase } from "../auth/supabase.js";
import { StatusBar } from "expo-status-bar";
import { picURL } from "../auth/supabase.js";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const Profile = ({ navigation, route }) => {
  const { updated, session } = route.params;

  const [editedUser, setEditedUser] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [uploading, setUploading] = useState(true);
  const [isUsername, setUsername] = useState("");
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const isFocused = useIsFocused();
  const [lastModified, setLastModified] = useState([]);

  const promptQuestions = {
    greek_life: "Are you participating in Greek Life?",
    budget: "My budget restrictions for housing are...",
    night_out: "A perfect night out for me looks like...",
    pet_peeves: "My biggest pet peeves are...",
    favorite_movies: "My favorite movies are...",
    favorite_artists: "My favorite artists / bands are...",
    living_considerations:
      "The dorms halls / apartment complexes I'm considering are...",
    sharing: "When it comes to sharing my amenities and personal property...",
    cooking: "When it comes to sharing food and cooking...",
    burnt_out: "When I'm burnt out, I relax by...",
    involvement: "The organizations I'm involved in on campus are...",
    smoking: "My opinion toward smoking in the dorm / apartment are...",
    other_people: "My thoughts on having guests over are...",
    temperature: "I like the temperature of the room to be...",
    pets: "My thoughts on having pets are...",
    parties: "My thoughts on throwing parties are...",
    decorations: "My ideas for decorating the home involve...",
    conflict: "When it comes to handling conflict, I am...",
  };

  const hasValidItems = prompts.some((item) => item.answer);

  const scrollY = new Animated.Value(0);

  const profileOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const profileZIndex = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, -1],
    extrapolate: "clamp",
  });

  const DISABLE_TOUCHABLE_SCROLL_POINT = 100;
  const loadData = async () => {
    try {
      const cachedUserData = await AsyncStorage.getItem("userData");
      if (cachedUserData !== null) {
        //alert(cachedUserData);
        setEditedUser(JSON.parse(cachedUserData));
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error loading user data from cache:", error);
    }
  };

  useEffect(() => {
    loadData();
    fetchData();
    if (updated && isFocused) {
      fetchData();
    }
  }, [updated, isFocused]);

  const fetchData = async () => {
    fetchProfile();
    getProfilePicture();
    const username = await fetchUsername(session);
    setUsername(username);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .select("name, bio, tags, major, class_year, hometown")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error(error.message);
    } else {
      setEditedUser(data);
    }

    const { data: promptsData, error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", session.user.id);
    if (promptsData) {
      const answeredPrompts = Object.entries(promptsData[0])
        .filter(
          ([prompt, answer]) =>
            answer !== null && prompt !== "id" && prompt !== "user_id"
        )
        .map(([prompt, answer]) => ({ prompt, answer }));

      setPrompts(answeredPrompts);
      //console.log(answeredPrompts);
    } else {
      console.log("Error fetching prompts: ", promptsError);
    }
  };

  const getProfilePicture = async (navigation) => {
    try {
      let lastModified;
      const { data, error } = await supabase
        .from("images")
        .select("last_modified")
        .eq("user_id", session.user.id)
        .eq("image_index", 0)
        .single();

      if (error) {
        //alert(error.message);
      }

      if (data) {
        // alert(`Image data fetched: ${JSON.stringify(data)}`);
        lastModified = data.last_modified;
      }
      const profilePictureURL = `${picURL}/${session.user.id}/${session.user.id}-0-${lastModified}`;

      const response = await fetch(profilePictureURL);
      if (response.ok) {
        setUploading(false);
        setProfilePicture(profilePictureURL);
      } else {
        setUploading(false);
        setProfilePicture(null);
      }
    } catch (error) {
      console.log("Couldn't fetch profile picture");
    }
  };

  handleEditPictures = async () => {
    if (scrollY._value < DISABLE_TOUCHABLE_SCROLL_POINT) {
      navigation.navigate("AddProfileImages", {
        profilePicture: profilePicture,
      });
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.viewContainer}>
        {/* <ConfettiCannon count={200} origin={{x: -10, y: 0}} /> */}
        <View style={styles.topBar}>
          <Text style={styles.username}>{isUsername}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate("EditProfileScreen", {
                  editedUser,
                  prompts,
                  profilePicture,
                });
              }}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SettingsScreen");
              }}
            >
              <Icon name="gear" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View
          style={{
            ...styles.profileContainer,
            opacity: profileOpacity,
            zIndex: profileZIndex,
          }}
        >
          <View>
            {/* Show loading indicator when uploading */}
            {uploading ? (
              <View style={styles.profilePictureContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : profilePicture ? (
              /* If uploading is done and profile picture exists */
              <TouchableOpacity
                style={styles.profilePictureContainer}
                onPress={handleEditPictures}
              >
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.profilePicture}
                />
              </TouchableOpacity>
            ) : (
              /* If uploading is done but no profile picture exists */
              <TouchableOpacity
                style={styles.profilePictureContainer}
                onPress={handleEditPictures}
              >
                <Icon name={"plus"} size={40} color={"grey"} />
              </TouchableOpacity>
            )}

            {!profilePicture && !uploading && (
              <View style={styles.uploadPromptContainer}>
                <Text style={styles.uploadPrompt}>
                  Upload a photo to make yourself visible to other people!
                </Text>
              </View>
            )}
          </View>
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
            <View style={styles.roundedContainer}>
              <Text style={styles.nameHeader} paddingBottom={15}>
                {editedUser.name}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                paddingBottom={20}
                paddingTop={4}
                paddingHorizontal={15}
              >
                {editedUser.class_year && (
                  <View style={styles.infoContainer}>
                    <Entypo name="graduation-cap" size={22} color="white" />
                    <Text style={styles.detailsText}>
                      {" "}
                      {editedUser.class_year}
                    </Text>
                  </View>
                )}

                {editedUser.major && (
                  <View style={styles.infoContainer}>
                    <View style={styles.verticalDivider2} />
                    <Entypo name="open-book" size={22} color="white" />
                    <Text style={styles.detailsText}> {editedUser.major}</Text>
                  </View>
                )}
                {!editedUser.hometown && (
                  <View style={styles.infoContainer} paddingRight={33}></View>
                )}
                {editedUser.hometown && (
                  <View style={styles.infoContainer} paddingRight={35}>
                    <View style={styles.verticalDivider2} />
                    <MaterialIcons
                      name="home-filled"
                      marginLeft={-2}
                      size={26}
                      color="white"
                    />
                    <Text style={styles.detailsText}>
                      {editedUser.hometown}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            <View style={styles.roundedContainer}>
              <View style={styles.bio}>
                <View>
                  <Text style={styles.bioHeader}>About Me</Text>
                  <Text style={styles.bioText}>
                    {editedUser.bio
                      ? editedUser.bio
                      : "Your bio is looking empty... click edit to add information and let others get to know you better!"}
                  </Text>
                </View>
              </View>
            </View>

            {prompts.some((item) => item.answer) && (
              <View style={styles.roundedContainer}>
                {prompts.some((item) => item.answer) && (
                  <Text style={styles.bioHeader}>Additional Info</Text>
                )}
                <ScrollView
                  horizontal
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
              {editedUser.tags && editedUser.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {editedUser.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  scrollView: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollViewContent: {
    paddingTop: 370,
  },

  settingsIcon: {
    padding: 8,
    width: 25,
    height: 25,
    borderRadius: 4,
  },
  viewContainer: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#1D1D20",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  bio: {
    fontSize: 18,
    fontWeight: "600",
    //paddingLeft: 25,
    paddingBottom: 35,

    marginBottom: 0,
    //color: "white",
  },
  nameHeader: {
    alignSelf: "center",
    fontWeight: "700",
    paddingBottom: 20,
    marginTop: 20,
    marginBottom: 5,
    fontSize: 20,
    color: "white",
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
  promptsHeader: {
    paddingTop: 20,
    marginBottom: -5,
    alignSelf: "center",
    fontWeight: "600",
    fontSize: 20,
    color: "white",
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#14999999",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileContainer: {
    flex: 1,
    padding: 16,
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    margin: 0,
    alignSelf: "center",
  },
  profilePictureContainer: {
    marginTop: "25%",
    width: 250,
    height: 250,
    backgroundColor: "#2B2D2D",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 150,
  },
  profilePicture: {
    width: 255,
    height: 255,
    borderRadius: 150,
    borderWidth: 0.8,
    borderColor: "grey",
  },

  uploadingIndicatorContainer: {
    position: "absolute",
    backgroundColor: "#1D1D20",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
  },
  profileDetails: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
    gap: 10,
    borderBottomColor: "grey",
    borderBottomWidth: 0.3,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    //color: "white",
  },
  text: {
    fontSize: 16,
    color: "white",
  },
  bioText: {
    fontSize: 16,
    marginLeft: 25,
    color: "white",
  },
  input: {
    fontSize: 16,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: "#111111",
    borderRadius: 15,
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 45,
  },
  tag: {
    backgroundColor: "#14999999",
    borderRadius: 20,
    borderColor: "#2B2D2F",
    borderWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
  },
  tagText: {
    fontSize: 14,
    color: "white",
    fontWeight: 600,
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
  details: {
    alignItems: "left",
    justifyContent: "center",
    gap: 23,
  },

  tab: {
    // 1D1D20
    backgroundColor: "#111111", //101010
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
  },
  color: {
    flex: 1,
    backgroundColor: "lightblue",
  },

  itemPrompt: {
    fontSize: 15,
    marginBottom: 5,
    color: "white",
  },
  itemAnswer: {
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
  },
  uploadPromptContainer: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    //top: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadPrompt: {
    color: "lightgrey",
    fontSize: 10,
    fontWeight: "400",
    textAlign: "center",
  },
  detailsText: {
    color: "white",
    fontSize: 16,
    textAlign: "justify",
  },
  roundedContainer: {
    backgroundColor: "#1D1D20",
    borderRadius: 50,
    padding: 1,
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
    marginRight: 10,
    marginLeft: 10,
  },
  tag: {
    backgroundColor: "#14999999",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
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

  infoContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    flexDirection: "row",
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

export default Profile;
