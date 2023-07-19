import { NavigationContainerRefContext } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { supabase } from "../auth/supabase";
import Icon from "react-native-vector-icons/FontAwesome";
import { picURL } from "../auth/supabase";

export const EditProfileScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [major, setMajor] = useState("");
  const [editedUser, setEditedUser] = useState(session.user);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Assume we have a user and user id, for this example I'll use a static id
  const userId = "1";

  useEffect(() => {
    fetchProfile();
    getProfilePicture();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .select("name, bio, major")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      /*setName(data.name);
      setBio(data.bio);
      setMajor(data.major);*/
      setEditedUser(data);
    } else {
      console.log("Error fetching profile: ", error);
    }
  };
  const getProfilePicture = async (navigation) => {
    try {
      const profilePictureURL = `${picURL}/${session.user.id}/${session.user.id}-0`; // Replace '...' with the actual URL of the profile picture

      const response = await fetch(profilePictureURL, {
        cache: "no-store",
      });
      if (response.ok) {
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onload = () => {
          const decodedData = reader.result;
          setProfilePicture(decodedData);
        };
        reader.readAsDataURL(blob);
      } else {
        // Handle response error
      }
    } catch (error) {
      // Handle fetch or other errors
    }
  };

  const updateProfil = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .update([
        {
          name: editedUser.name,
          bio: editedUser.bio,
          major: editedUser.major,
        },
      ])
      .eq("user_id", session.user.id);

    if (error) {
      console.log("Error updating profile: ", error);
    } else {
      console.log("Profile updated successfully: ", data);
      navigation.navigate("Tabs", { updated: true });
    }
  };

  const updateProfile = async () => {
    // Update the user's profile in the database
    if (session?.user) {
      const { data, error } = await supabase.from("UGC").upsert([
        {
          user_id: session.user.id,
          name: editedUser.name,
          bio: editedUser.bio,
          major: editedUser.major,
        },
      ]);

      if (error) {
        if (error.message.includes("UGC_user_id_key")) {
          const { data, error: updateError } = await supabase
            .from("UGC")
            .update([
              {
                name: editedUser.name,
                bio: editedUser.bio,
                major: editedUser.major,
              },
            ])
            .eq("user_id", session.user.id);

          if (updateError) {
            alert(updateError.message);
          } else {
            navigation.navigate("Tabs", { updated: true });
          }
        } else {
          alert(error.message);
        }
      } else {
        navigation.navigate("Tabs", { updated: true });
      }
    }
  };

  handleEditPictures = async () => {
    navigation.navigate("AddProfileImages");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={28} color="blue" />
      </TouchableOpacity>
      <ScrollView>
        <View style={styles.profileContainer}>
          {profilePicture ? (
            <TouchableOpacity
              style={styles.profilePictureContainer}
              //onPress={handleImageUpload}
              onPress={handleEditPictures}
              //disabled={uploading}
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
              //disabled={uploading}
            >
              <Text style={styles.profilePictureText}>Add Photo</Text>
              {uploading && (
                <View style={styles.uploadingIndicatorContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.name}
            onChangeText={(name) => setEditedUser({ ...editedUser, name })}
            placeholder="Name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.bio}
            onChangeText={(bio) => setEditedUser({ ...editedUser, bio })}
            multiline
            placeholder="Bio"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Major:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.major}
            onChangeText={(major) => setEditedUser({ ...editedUser, major })}
            placeholder="Major"
          />
        </View>

        <Button title="Update Profile" onPress={updateProfile} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 10,
    textAlign: "center",
  },
  input: {
    flex: 0,
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "start",
    // centers TextInput horizontally
    borderBottomColor: "#1499",
    borderBottomWidth: 2,
    marginBottom: 20,

    gap: 20,
  },

  backButton: {
    marginLeft: 10,
  },
  profilePictureContainer: {
    width: 171,
    height: 311,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
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
});

export default EditProfileScreen;
