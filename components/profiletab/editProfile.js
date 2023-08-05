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
import { AntDesign } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { supabase } from "../auth/supabase";
import Icon from "react-native-vector-icons/FontAwesome";
import { picURL } from "../auth/supabase";

export const EditProfileScreen = ({ navigation, route }) => {
  const { updated, session } = route.params;

  const [editedUser, setEditedUser] = useState(route.params.editedUser);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [prompts, setPrompts] = useState(route.params.prompts);
  const isFocused = useIsFocused();

  //const { name, bio, major, class_year, hometown, tags } =
  //route.params.editedUser;

  const promptQuestions = {
    greek_life: "Are you participating in Greek Life?",
    night_out: "What is your idea of a perfect night out?",
    pet_peeves: "What are your biggest pet peeves?",
    favorite_movies: "What are your favorite movies?",
  };

  useEffect(() => {
    getProfilePicture();
    fetchPrompts();
  }, [updated, isFocused]);

  const fetchPrompts = async () => {
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
      console.log(answeredPrompts);
    } else {
      console.log("Error fetching prompts: ", promptsError);
    }
  };
  const getProfilePicture = async (navigation) => {
    try {
      const profilePictureURL = `${picURL}/${session.user.id}/${
        session.user.id
      }-0?${new Date().getTime()}`;

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
    <SafeAreaView style={styles.contain}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.bbuttonContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.bbutton}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Text style={styles.center}>Edit Profile</Text>
        </View>
        <TouchableOpacity
          style={styles.dbuttonContainer}
          onPress={() => navigation.goBack()} // Change this if you want a different action for the 'done' button
        >
          <Text style={styles.dbutton}>Done</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={prompts}
        renderItem={({ item }) =>
          item.answer ? (
            <TouchableOpacity
              style={styles.promptItem}
              onPress={() => navigation.navigate("AddPrompts")}
            >
              <Text style={styles.prompt}>{promptQuestions[item.prompt]}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </TouchableOpacity>
          ) : null
        }
        keyExtractor={(item) => item.prompt}
        ListHeaderComponent={
          <>
            <View style={styles.profileContainer}>
              {profilePicture ? (
                <TouchableOpacity
                  style={styles.profilePictureContainer}
                  onPress={handleEditPictures}
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
                onChangeText={(major) =>
                  setEditedUser({ ...editedUser, major })
                }
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

            <Text style={styles.more}>Interests</Text>
            {editedUser.tags && editedUser.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {editedUser.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("TagSelectionEdit")}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.more}>More about me:</Text>
          </>
        }
        ListFooterComponent={
          <>
            <TouchableOpacity
              style={styles.promptAdd}
              onPress={() => navigation.navigate("AddPrompts")}
            >
              <Text style={styles.prompt}>Add prompts</Text>
            </TouchableOpacity>

            <Button title="Update Profile" onPress={updateProfile} />
          </>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contain: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    flex: 0,
    fontSize: 16,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "column",
    borderBottomColor: "lightgrey",
    borderBottomWidth: 1,
    marginLeft: 20,
    marginBottom: 10,
    gap: 5,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    //backgroundColor: "transparent",
  },

  centerContainer: {
    padding: 7,
    alignSelf: "center",
    //backgroundColor: "transparent",
    // Style for the 'cancel' button container if needed
  },

  center: {
    alignSelf: "center",

    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  bbuttonContainer: {
    padding: 7,
    //backgroundColor: "transparent",
    // Style for the 'cancel' button container if needed
  },
  bbutton: {
    marginLeft: 15,
    fontSize: 16,
    color: "grey",
    fontWeight: "bold",
  },
  dbuttonContainer: {
    padding: 7,
  },
  dbutton: {
    marginRight: 16,
    fontSize: 17,
    color: "#149999",
    fontWeight: "bold",
    // Add other styling as needed
  },

  tag: {
    backgroundColor: "white",
    borderRadius: 20,
    borderColor: "grey",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderBottomColor: "lightgrey",
    borderRadius: 15,
    justifyContent: "center",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  profilePictureContainer: {
    margin: 30,
    width: 150,
    height: 150,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 200,
  },
  profilePicture: {
    borderWidth: 3,
    borderColor: "darkblue",
    width: 150,
    height: 150,
    borderRadius: 200,
  },
  profilePictureText: {
    fontSize: 16,
    color: "#fff",
  },
  promptItem: {
    padding: 30,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 40,
    gap: 10,
    borderColor: "grey",
    borderWidth: 1,
  },
  promptAdd: {
    padding: 30,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 40,
    gap: 10,
    borderColor: "black",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  answer: {
    fontSize: 16,
    color: "black",
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },

  more: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    margin: 10,
  },
});

export default EditProfileScreen;
