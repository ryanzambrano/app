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
} from "react-native";
import { fetchUsername } from "./profileUtils.js";
import { supabase } from "./auth/supabase.js";
import ImagePicker from "react-native-image-picker";

export const ProfileScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(session.user);
  const [isName, setIsName] = useState("");
  const [isBio, setIsBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isUsername, setUsername] = useState("");

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    fetchProfile();
    fetchData();
  }, []);

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
      setProfilePicture(data.profile_picture);
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

  const handleCancel = () => {
    // Revert the editedUser back to the original user object
    setEditedUser(session.user);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleImageUpload = () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else {
        // Image selected, upload it to the server
        const imageData = response.data;

        setUploading(true);
        try {
          // Upload the image using supabase storage or any other API
          // ...
        } catch (error) {
          console.error(error.message);
        } finally {
          setUploading(false);
        }
      }
    });
  };

  const handleImageRemove = async () => {
    try {
      await supabase.storage
        .from("profile-pictures")
        .remove([`profile-picture-${session.user.id}`]);

      setProfilePicture(null);
      await supabase
        .from("UGC")
        .update({ profile_picture: null })
        .eq("user_id", session.user.id);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Text style={styles.username}>{isUsername}</Text>
            {editing ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.profileContainer}>
            {profilePicture ? (
              <TouchableOpacity
                style={styles.profilePictureContainer}
                onPress={handleImageRemove}
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
                onPress={handleImageUpload}
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
              {editing && (
                <View>
                  <Text style={styles.label}>Name:</Text>
                  <TextInput
                    style={styles.input}
                    value={editedUser.name}
                    onChangeText={(name) =>
                      setEditedUser({ ...editedUser, name })
                    }
                  />

                  <Text style={styles.label}>Bio:</Text>
                  <TextInput
                    style={styles.input}
                    value={editedUser.bio}
                    onChangeText={(bio) =>
                      setEditedUser({ ...editedUser, bio })
                    }
                    multiline
                  />
                </View>
              )}
              {!editing && (
                <View>
                  <Text style={styles.label}></Text>
                  <Text style={styles.name}>{editedUser.name}</Text>

                  <Text style={styles.label}></Text>
                  <Text style={styles.text}>{editedUser.bio}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eBecf4",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    color: "black",
    borderBottomWidth: 0.5,
    borderColor: "#11",
    backgroundColor: "#12222",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#4EB1A3",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
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
  },
  profilePictureContainer: {
    width: 175,
    height: 300,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  profilePicture: {
    width: 80,
    height: 80,
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
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 16,
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

export default ProfileScreen;
