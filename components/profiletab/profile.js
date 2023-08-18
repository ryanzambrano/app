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
import { fetchUsername } from "../auth/profileUtils.js";
import { supabase } from "../auth/supabase.js";
import { StatusBar } from "expo-status-bar";
import { picURL } from "../auth/supabase.js";
import Icon from "react-native-vector-icons/FontAwesome";

export const Profile = ({ navigation, route }) => {
  const { updated, session } = route.params;

  const [editedUser, setEditedUser] = useState(session.user);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isUsername, setUsername] = useState("");
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const isFocused = useIsFocused();
  const [lastModified, setLastModified] = useState([]);

  const promptQuestions = {
    greek_life: "Are you participating in Greek Life?",
    night_out: "What is your idea of a perfect night out?",
    pet_peeves: "What are your biggest pet peeves?",
    favorite_movies: "What are your favorite movies?",
  };

  const hasValidItems = prompts.some((item) => item.answer);

  const scrollY = new Animated.Value(0);

  const profileOpacity = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const profileZIndex = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [1, -1],
    extrapolate: "clamp",
  });

  const DISABLE_TOUCHABLE_SCROLL_POINT = 100;

  useEffect(() => {
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
        .select("*")
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
        setProfilePicture(profilePictureURL);
      } else {
        setProfilePicture(null);
      }
    } catch (error) {
      alert("Couldn't fetch profile picture");
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
            {profilePicture ? (
              <TouchableOpacity
                style={styles.profilePictureContainer}
                onPress={handleEditPictures}
                disabled={uploading}
              >
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.profilePicture}
                />
                {uploading && (
                  <View style={styles.uploadingIndicatorContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.profilePictureContainer}
                onPress={handleEditPictures}
                disabled={uploading}
              >
                <Icon name={"plus"} size={40} color={"grey"} />
                {uploading && (
                  <View style={styles.uploadingIndicatorContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
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
            <View style={styles.profileDetails}>
              <Text style={styles.name}>{editedUser.name}</Text>

              <View style={styles.major}>
                <View style={styles.icons}>
                  <Icon name="graduation-cap" size={30} color="#14999999" />
                  <Icon name="book" size={30} color="#14999999" />
                  <Icon name="home" size={30} color="#14999999" />
                </View>
                <View style={styles.details}>
                  <Text style={styles.text}>{editedUser.class_year}</Text>
                  <Text style={styles.text}>{editedUser.major}</Text>
                  <Text style={styles.text}>{editedUser.hometown}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bio}>
              <View>
                <Text style={styles.bioHeader}>About me</Text>
                <Text style={styles.bioText}>{editedUser.bio}</Text>
              </View>
            </View>
            <View
              style={{
                borderBottomWidth: hasValidItems ? 0.3 : 0,
                borderBottomColor: "grey",

                borderBottomEndRadius: 20,
                borderBottomStartRadius: 20,
              }}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

            <Text style={styles.promptsHeader}>Interests</Text>
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
    paddingBottom: 25,
    paddingTop: 25,
    marginBottom: 0,
    //color: "white",
    borderBottomColor: "grey",
    borderBottomWidth: 0.3,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },

  bioHeader: {
    alignSelf: "center",
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 20,
    color: "white",
  },

  promptsHeader: {
    paddingTop: 20,
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 80,
    height: 80,
    borderRadius: 40,
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
    backgroundColor: "#111111",
    borderRadius: 15,
    justifyContent: "center",
    marginTop: 0,
    marginBottom: 20,
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
    gap: 10,
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
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
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

  itemContainer: {
    borderBottomWidth: 0.3,
    marginHorizontal: 15,
    borderWidth: 0.5,
    //borderColor: "grey",
    backgroundColor: "#2B2D2F",
    borderRadius: 50,
    padding: 30,
    width: 300,
    marginRight: 10,
    minWidth: 150,
    gap: 10,
    marginTop: 30,
    marginBottom: 30,
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
});

export default Profile;
