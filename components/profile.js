import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { supabase } from "./auth/supabase.js";

export const ProfileScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(session.user);
  const [isName, setIsName] = useState("");
  const [isBio, setIsBio] = useState("");

  const upserts = {
    name: isName,
    bio: isBio,
  };

  const handleSave = async (upserts) => {
    // Update the user's profile in the database

    if (session?.user) {
      const { data, error } = await supabase.from("UGC").upsert([
        {
          user_id: session.user.id,
          name: upserts.name,
          bio: upserts.bio,
        },
      ]);
      //.eq("user_id", session.user.id);

      // Update the user object with edited information
      //setUser(editedUser);
      if (error) {
        if (error.message.includes("UGC_user_id_key")) {
          const { data, error } = await supabase
            .from("UGC")
            .update([
              {
                //user_id: session.user.id,
                name: upserts.name,
                bio: upserts.bio,
              },
            ])
            .eq("user_id", session.user.id);
          // Handle unique key constraint violation error
          // For example, you can display an error message to the user
        } else {
          // Handle other errors
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eBecf4" }}>
      <View style={styles.container}>
        <Text style={styles.label}>Name:</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={editedUser.name}
            onChangeText={(name) => setIsName({ ...isName, name })}
          />
        ) : (
          <Text style={styles.text}>{editedUser.name}</Text>
        )}

        <Text style={styles.label}>Bio:</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={editedUser.bio}
            onChangeText={(bio) => setEditedUser({ ...isBio, bio })}
            multiline
          />
        ) : (
          <Text style={styles.text}>{editedUser.bio}</Text>
        )}

        {editing ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                handleSave(upserts);
              }}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: "#4EB1A3",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  editButton: {
    marginVertical: 16,
    padding: 12,
    borderRadius: 4,
    backgroundColor: "#4EB1A3",
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default ProfileScreen;
