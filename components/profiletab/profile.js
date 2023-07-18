import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
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
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { picURL } from "../auth/supabase.js";
import { decode } from "base64-arraybuffer";
// npm install base64-arraybuffer

export const Profile = ({ navigation, route }) => {
  const { updated, session } = route.params;

  const [editedUser, setEditedUser] = useState(session.user);
  const [isName, setIsName] = useState("");
  const [isBio, setIsBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isUsername, setUsername] = useState("");
  const isFocused = useIsFocused();

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    fetchProfile();
    fetchData();
    getProfilePicture();
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
      .select("name, bio") // add the profile picture later
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error(error.message);
    } else {
      setEditedUser(data);
    }
  };

  const getProfilePicture = async () => {
    try {
      // Add timestamp as a query parameter to the URL
      const profilePictureURL = `${picURL}/${session.user.id}/${
        session.user.id
      }-0?${new Date().getTime()}`;
      const response = await fetch(profilePictureURL);

      if (response.ok) {
        setProfilePicture(profilePictureURL); // Set the profile picture URL
      } else {
        setProfilePicture(null); // Set profile picture to null if the image at the URL does not exist
      }
    } catch (error) {
      console.error(error);
    }
  };

  const upserts = {
    name: isName,
    bio: isBio,
  };

  const handleSave = async () => {
    // Update the user's profile in the database
    if (session?.user) {
      const { data, error } = await supabase.from("UGC").upsert([
        {
          user_id: session.user.id,
          name: upserts.name,
          bio: editedUser.bio,
        },
      ]);

      if (error) {
        if (error.message.includes("UGC_user_id_key")) {
          const { data, error } = await supabase
            .from("UGC")
            .update([
              {
                name: editedUser.name,
                bio: editedUser.bio,
              },
            ])
            .eq("user_id", session.user.id);
        } else {
          alert(error.message);
        }
      } else {
        setEditing(false);
      }
    }
    setEditing(false);
  };
  const handleImageUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    try {
      const imagePickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!imagePickerResult.canceled) {
        setProfilePicture(imagePickerResult.assets[0].uri);

        const { error: removeError } = await supabase.storage
          .from("user_pictures")
          .remove(`profile_pictures/profile_${session.user.id}`);

        if (removeError) {
          alert(removeError.message + `profile_${session.user.id}`);
        }

        const base64Data = imagePickerResult.assets[0].base64;

        const buffer = decode(base64Data);

        const { data, error: uploadError } = await supabase.storage
          .from("user_pictures")
          .upload(`profile_pictures/profile_${session.user.id}`, buffer, {
            contentType: "image/jpeg", // Replace with the appropriate content type if necessary
          });
        if (uploadError) {
          alert(uploadError.message);
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };

  handleEditPictures = async () => {
    navigation.navigate("AddProfileImages");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.profileContainer}>
              {profilePicture ? (
                <TouchableOpacity
                  style={styles.profilePictureContainer}
                  //onPress={handleImageUpload}
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
                  //onPress={handleImageUpload}
                  onPress={handleEditPictures}
                  disabled={uploading}
                >
                  <Text style={styles.profilePictureText}>Add Photo</Text>
                  {uploading && (
                    <View style={styles.uploadingIndicatorContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              <View style={styles.profileDetails}>
                <View>
                  <Text style={styles.label}></Text>
                  <Text style={styles.name}>{editedUser.name}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bio}>
              <View>
                <Text style={styles.label}></Text>
                <Text style={styles.text}>{editedUser.bio}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  scrollContainer: { flex: 1 },

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

    backgroundColor: "white",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
  },

  bio: {
    fontSize: 18,
    fontWeight: "600",
    paddingLeft: 16,
    margin: 0,
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
    width: 171,
    height: 311,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  profilePicture: {
    width: 171,
    height: 311,
    borderRadius: 20,
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
});

export default Profile;
