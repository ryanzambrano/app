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
  FlatList,
} from "react-native";
import { supabase } from "../auth/supabase";
import Icon from "react-native-vector-icons/FontAwesome";
import { picURL } from "../auth/supabase";

export const EditProfileScreen = ({ navigation, route }) => {
  const { session } = route.params;

  const [editedUser, setEditedUser] = useState(session.user);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [prompts, setPrompts] = useState([]);

  // Assume we have a user and user id, for this example I'll use a static id
  const userId = "1";

  useEffect(() => {
    fetchProfile();
    getProfilePicture();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .select("name, bio, major, class_year, hometown")
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

    const { data: promptsData, error: promptsError } = await supabase
      .from("prompts") // Replace "PromptsTable" with the actual table name.
      .select("*")
      .eq("user_id", session.user.id);
    if (promptsData) {
      setPrompts(promptsData);
    } else {
      console.log("Error fetching prompts: ", promptsError);
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

  const updateProfile = async () => {
    // Update the user's profile in the database
    if (session?.user) {
      const { data, error } = await supabase.from("UGC").upsert([
        {
          user_id: session.user.id,
          name: editedUser.name,
          bio: editedUser.bio,
          major: editedUser.major,
          class_year: editedUser.class_year,
          hometown: editedUser.hometown,
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
                class_year: editedUser.class_year,
                hometown: editedUser.hometown,
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
          <Text style={styles.label}>Class Year:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.class_year}
            onChangeText={(class_year) =>
              setEditedUser({ ...editedUser, class_year })
            }
            placeholder="Select your Graduation Year"
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hometown:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.hometown}
            onChangeText={(hometown) =>
              setEditedUser({ ...editedUser, hometown })
            }
            placeholder="Hometown"
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

        <FlatList
          data={prompts}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.promptItem}
              onPress={() =>
                navigation.navigate("AddPrompts", { prompt: item })
              }
            >
              <Text style={styles}>Add prompts!</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          // Replace "id" with the actual column name for the prompt id.
        />

        <TouchableOpacity
          style={styles.promptItem}
          onPress={() => navigation.navigate("AddPrompts")}
        >
          <Text style={styles}>Add prompts</Text>
        </TouchableOpacity>

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
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 10,
    textAlign: "center",
  },
  input: {
    flex: 0,
    fontSize: 16,
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
    margin: 30,
    width: 100,
    height: 100,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 100,
  },
  profilePicture: {
    //marginTop: 5,
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  profilePictureText: {
    fontSize: 16,
    color: "#fff",
  },

  promptItem: {
    //backgroundColor: "#F0F0F0", // This can be any color you choose
    padding: 30, // Adjusts the size of the rectangle
    marginVertical: 8, // Adjusts the space between rectangles
    marginHorizontal: 16, // Adjusts the space to the side of the rectangles
    borderRadius: 40, // Makes the corners slightly rounded
    // If you want a border around the rectangle you can uncomment the following lines:
    borderColor: "grey",
    borderWidth: 1,
  },
});

export default EditProfileScreen;
