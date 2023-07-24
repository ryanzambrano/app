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
import { useIsFocused } from "@react-navigation/native";
import { supabase } from "../auth/supabase";
import Icon from "react-native-vector-icons/FontAwesome";
import { picURL } from "../auth/supabase";

export const EditProfileScreen = ({ navigation, route }) => {
  const { updated, session } = route.params;

  const [editedUser, setEditedUser] = useState(session.user);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const isFocused = useIsFocused();

  const promptQuestions = {
    greek_life: "Are you participating in Greek Life?",
    night_out: "What is your idea of a perfect night out?",
    pet_peeves: "What are your biggest pet peeves?",
    favorite_movies: "What are your favorite movies?",
  };

  useEffect(() => {
    fetchProfile();
    getProfilePicture();
  }, [updated, isFocused]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .select("name, bio, major, class_year, hometown")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setEditedUser(data);
    } else {
      console.log("Error fetching profile: ", error);
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={28} color="blue" />
      </TouchableOpacity>
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
          </>
        }
        ListFooterComponent={
          <>
            <TouchableOpacity
              style={styles.promptAdd}
              onPress={() => navigation.navigate("AddPrompts")}
            >
              <Text style={styles}>Add prompts</Text>
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
    textAlign: "start",
  },
  input: {
    flex: 0,
    fontSize: 16,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "column",
    justifyContent: "start",
    borderBottomColor: "lightgrey",
    borderBottomWidth: 1,
    marginLeft: 20,
    marginBottom: 10,
    gap: 5,
  },
  backButton: {
    marginLeft: 10,
  },
  profilePictureContainer: {
    margin: 30,
    width: 250,
    height: 250,
    borderWidth: 5,
    borderColor: "grey",
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 200,
  },
  profilePicture: {
    borderWidth: 3,
    borderColor: "lightgrey",
    width: 250,
    height: 250,
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
    color: "#1",
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
});

export default EditProfileScreen;
