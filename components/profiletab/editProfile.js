import { NavigationContainerRefContext } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { supabase } from "../auth/supabase";

export const EditProfileScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [major, setMajor] = useState("");
  const [editedUser, setEditedUser] = useState(session.user);

  // Assume we have a user and user id, for this example I'll use a static id
  const userId = "1";

  useEffect(() => {
    fetchProfile();
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

  const updateProfile = async () => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={editedUser.name}
        onChangeText={(name) => setEditedUser({ ...editedUser, name })}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={styles.input}
        value={editedUser.bio}
        onChangeText={(bio) => setEditedUser({ ...editedUser, bio })}
        multiline
      />

      <Text style={styles.label}>Major</Text>
      <TextInput
        style={styles.input}
        value={editedUser.major}
        onChangeText={(major) => setEditedUser({ ...editedUser, major })}
      />

      <Button title="Update Profile" onPress={updateProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});

export default EditProfileScreen;
