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
import Retake from "../retakeQuestionaireFiles/retake.js";

export const EditProfileScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [editedUser, setEditedUser] = useState(route.params.editedUser);
  //editedUser.tags = route.params.selectedTags;
  const [bioCharCount, setBioCharCount] = useState("");

  const { updated } = route.params;
  const selectedTags = route.params.selectedTags;
  //alert(updated);
  const [profilePicture, setProfilePicture] = useState(
    route.params.profilePicture
  );
  const [uploading, setUploading] = useState(false);
  const [prompts, setPrompts] = useState(route.params.prompts);
  const isFocused = useIsFocused();

  if (updated == true) {
    editedUser.tags = selectedTags;
  }

  //const { name, bio, major, class_year, hometown, tags } =

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

  useEffect(() => {
    getProfilePicture();
    fetchLists();
  }, [updated, isFocused]);

  const fetchLists = async () => {
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
      console.log(error.message);
    }
  };

  const updateProfile = async () => {
    if (session?.user) {
      if (editedUser.name.trim() === "") {
        alert("Must enter a name");
        return;
      }
      if (editedUser.name.length > 30) {
        alert("Please enter a valid name");
        return;
      }
      const classYear = Number(editedUser.class_year);
      if (isNaN(classYear) || classYear < 2023 || classYear > 2030) {
        alert("Please enter a valid class year");
        return;
      }

      if (editedUser.major.length > 30) {
        alert("Please enter a valid major");
        return;
      }

      if (editedUser.hometown.length > 30) {
        alert("Please enter a valid hometown");
        return;
      }

      if (editedUser.bio.length <= 700) {
        const trimmedBio = editedUser.bio.trimEnd();
        const name = editedUser.name.trimEnd();
        const major = editedUser.major.trimEnd();
        const class_year = editedUser.class_year.trimEnd();
        const hometown = editedUser.hometown.trimEnd();
        const { data, error } = await supabase
          .from("UGC")
          .update([
            {
              name: name,
              bio: trimmedBio,
              major: major,
              class_year: class_year,
              hometown: hometown,
            },
          ])
          .eq("user_id", session.user.id);
        if (error) {
          console.error(error.message);
        } else {
          navigation.navigate("Tabs", { updated: true });
        }
      } else {
        alert("Too many characters in Bio");
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
          onPress={updateProfile}
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
              <Text style={{ color: "white" }}>
                {promptQuestions[item.prompt]}
              </Text>
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
                placeholderTextColor="#575D61"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Class Year:</Text>
              <TextInput
                style={styles.input}
                value={editedUser.class_year}
                keyboardAppearance="dark"
                onChangeText={(class_year) =>
                  setEditedUser({ ...editedUser, class_year })
                }
                placeholder="Graduation Year"
                placeholderTextColor="#575D61"
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
                placeholderTextColor="#575D61"
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
                placeholderTextColor="#575D61"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio:</Text>
              <TextInput
                style={styles.input}
                value={editedUser.bio}
                onChangeText={(bio) => {
                  setEditedUser({ ...editedUser, bio });
                  setBioCharCount(bio.length);
                }}
                multiline
                placeholder="Bio"
                placeholderTextColor="#575D61"
              />
              <Text
                style={{
                  color: bioCharCount > 700 ? "red" : "lightgrey",
                  textAlign: "right",
                  marginRight: 10,
                  marginBottom: 10,
                  fontSize: 12,
                }}
              >
                {bioCharCount}/700
              </Text>
            </View>

            <Text style={styles.more}>Interests</Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: 500,
                color: "darkgrey",
                paddingBottom: 8,
              }}
            >
              Click any tag to edit
            </Text>
            {editedUser.tags && editedUser.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {editedUser.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("TagSelectionEdit", { editedUser })
                      }
                    >
                      <Text style={{ color: "white", fontWeight: 500 }}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.more}>More about me:</Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: 500,
                color: "darkgrey",
                paddingBottom: 8,
              }}
            >
              Click any prompt to edit
            </Text>
          </>
        }
        ListFooterComponent={
          <>
            <TouchableOpacity
              style={styles.promptAdd}
              onPress={() => navigation.navigate("AddPrompts")}
            >
              <Text style={{ color: "white" }}>Edit prompts</Text>
            </TouchableOpacity>

            <View style={styles.questionaireInputContainer}>
              <Text style={styles.more}>Questionaire Answers</Text>
              <TouchableOpacity
                style={styles.questionaireButton}
                onPress={() => navigation.navigate("Retake")}
              >
                <Text style={{ color: "white", fontSize: 16, fontWeight: 500 }}>
                  Edit Questionaire Answers
                </Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: "#1D1D20",
  },
  label: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  input: {
    flex: 0,
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: "column",
    borderBottomColor: "#2B2D2F",
    borderBottomWidth: 1.4,
    borderBottomRightRadius: 20,
    paddingRight: 10,
    marginLeft: 20,
    marginBottom: 10,
    gap: 5,
  },

  questionaireInputContainer: {
    flexDirection: "column",
    borderTopColor: "#2B2D2F",
    borderTopWidth: 1.4,
    marginHorizontal: 10,
    marginTop: 10,
    paddingTop: 10,
    marginBottom: 10,
    gap: 5,
  },

  questionaireButton: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 15,
    gap: 10,
    borderWidth: 1,
    backgroundColor: "#14999999",
    alignItems: "center",
  },
  Container: {
    flexDirection: "column",
    borderBottomColor: "#2B2D2F",
    borderBottomWidth: 1.4,
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
  },

  center: {
    alignSelf: "center",

    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  bbuttonContainer: {
    padding: 7,
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
    backgroundColor: "#14999999",
    borderRadius: 20,

    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderBottomColor: "#2B2D2F",
    borderRadius: 15,
    justifyContent: "center",
    paddingBottom: 18,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1.4,
  },
  profilePictureContainer: {
    margin: 50,
    width: 150,
    height: 150,
    backgroundColor: "#2B2D2F",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 200,
  },
  profilePicture: {
    //borderWidth: 3,
    borderColor: "darkblue",
    width: 200,
    height: 200,
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
    backgroundColor: "#252d36",
  },
  promptAdd: {
    padding: 30,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 40,
    gap: 10,
    borderColor: "white",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  answer: {
    fontSize: 16,
    color: "white",
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },

  more: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    margin: 10,
    marginBottom: 6,
  },
});

export default EditProfileScreen;
