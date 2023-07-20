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
  TouchableWithoutFeedback,
  Keyboard,
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
  const isFocused = useIsFocused();

  const scrollY = new Animated.Value(0);

  const profileOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    fetchProfile();
    fetchData();
    getProfilePicture();
    console.log(editedUser.tags);
    if (updated && isFocused) {
      fetchProfile();
      fetchData();
      getProfilePicture(); // your data fetching function here
    }
  }, [updated, isFocused]);

  const fetchData = async () => {
    await fetchProfile();
    const username = await fetchUsername(session);
    setUsername(username);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .select("name, bio, tags, major, class_year, hometown") // add the profile picture later
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error(error.message);
    } else {
      setEditedUser(data);
      //setProfilePicture(data.profile_picture);
    }
  };

  const getProfilePicture = async (navigation) => {
    try {
      const profilePictureURL = `${picURL}/${session.user.id}/${
        session.user.id
      }-0?${new Date().getTime()}`; // Replace '...' with the actual URL of the profile picture

      const response = await fetch(profilePictureURL, {
        cache: "no-store",
      });
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
    navigation.navigate("AddProfileImages");
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
                navigation.navigate("EditProfileScreen");
              }}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                navigation.navigate("SettingsScreen");
              }}
            >
              <Image
                style={styles.settingsIcon}
                source={{
                  uri: "https://th.bing.com/th/id/OIP.nEKx7qYL-7aettL7yMDiOgHaHv?pid=ImgDet&rs=1",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View
          style={{ ...styles.profileContainer, opacity: profileOpacity }}
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
                <Image
                  source={{
                    uri: "https://www.nicepng.com/png/detail/73-730154_open-default-profile-picture-png.png",
                  }}
                  style={styles.profilePicture}
                />
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
            { useNativeDriver: false } // Add this line if it's missing
          )}
          scrollEventThrottle={16}
          bounces={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.tab}>
            <View style={styles.profileDetails}>
              <View style={styles.name}>
                <Text style={styles.name}>{editedUser.name}</Text>
              </View>

              <View style={styles.major}>
                <View style={styles.icons}>
                  <Icon name="graduation-cap" size={30} color="grey" />
                  <Icon name="book" size={30} color="grey" />
                  <Icon name="map-marker" size={30} color="grey" />
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
                <Text style={styles.text}>{editedUser.bio}</Text>
              </View>
            </View>

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
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  scrollView: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    //backgroundColor: "white",
  },
  scrollViewContent: {
    paddingTop: 450, // this should be the same as the profile picture height
    //backgroundColor: "white",
  },

  settingsIcon: {
    padding: 8,
    width: 25,
    height: 25,
    borderRadius: 4,
  },

  viewContainer: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    paddingLeft: 15,
    paddingRight: 15,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    //height: 50,
    zIndex: 10,
    backgroundColor: "white",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
    marginBottom: 10,
  },

  bio: {
    fontSize: 18,
    fontWeight: "600",
    paddingLeft: 16,
    marginTop: 20,
    marginBottom: 20,
  },

  editButton: {
    padding: 8,
    borderRadius: 4,
    //marginRight: 20,
    backgroundColor: "#4EB1A3",
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
  saveButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#4EB1A3",
  },
  cancelButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#aaa",
  },
  profileContainer: {
    flex: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    margin: 0,
  },
  profilePictureContainer: {
    marginTop: "25%",
    width: 250,
    height: 250,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 150,
  },
  profilePicture: {
    //marginTop: 5,
    width: 250,
    height: 250,
    borderRadius: 150,
  },
  profilePictureText: {
    fontSize: 16,
    color: "#fff",
  },
  uploadingIndicatorContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 80,
    height: 80,
    borderRadius: 40,
    //justifyContent: "center",
    //alignItems: "center",
  },
  profileDetails: {
    flex: 1,
    padding: 16,
    gap: 10,
    borderBottomColor: "lightgrey",
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    //marginBottom: 16,
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
    //backgroundColor: "#404040",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 10,
    borderRadius: 15,
    justifyContent: "center",
    marginTop: 50,
    marginBottom: 100,
  },
  tag: {
    backgroundColor: "#f3a034",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
  },
  tagText: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },

  major: {
    //paddingLeft: 16,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "left",
  },

  icons: {
    alignContent: "center",
    alignItems: "center",
  },

  details: {
    alignItems: "left",
    justifyContent: "center",
    gap: 13,
  },

  tab: {
    backgroundColor: "white",
    flex: 1,
    height: 500,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  color: {
    flex: 1,
    backgroundColor: "lightblue",
  },
});

export default Profile;
