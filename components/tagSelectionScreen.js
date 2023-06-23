import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { supabase } from "./auth/supabase.js";
import { Session } from "@supabase/supabase-js";

const TagSelectionScreen = ({ session }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  const availableTags = [
    "Technology",
    "Art",
    "Sports",
    "Music",
    "Fashion",
    "Food",
    "Travel",
    "Fitness",
    "Gaming",
    "Books",
    "Movies",
    "Nature",
    "Photography",
    "Cooking",
    "History",
    "Science",
    "Animals",
    "DIY",
    "Health",
    "Politics",
    "Education",
    "Design",
    "Business",
    "Writing",
    "Cars",
    "Beauty",
  ];

  const handleTagSelection = (tag) => {
    const isTagSelected = selectedTags.includes(tag);
    if (isTagSelected) {
      setSelectedTags(
        selectedTags.filter((selectedTag) => selectedTag !== tag)
      );
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const renderTag = (tag) => {
    const isTagSelected = selectedTags.includes(tag);
    return (
      <TouchableOpacity
        key={tag}
        style={[styles.tag, isTagSelected && styles.selectedTag]}
        onPress={() => handleTagSelection(tag)}
      >
        <Text style={isTagSelected ? styles.selectedTagText : styles.tagText}>
          {tag}
        </Text>
      </TouchableOpacity>
    );
  };

  const updateProfile = async (userData) => {
    // Update the user profile in the 'profiles' table
    const { data, error } = await supabase
      .from("profiles")
      .update([
        {
          tags: selectedTags,
        },
      ])
      .eq("id", "31");

    if (error) {
      alert("Error updating profile:", error.message);
    } else {
      alert("Profile updated successfully:", data);
    }
  };

  async function signOut() {
    const { error } = await supabase.auth.signOut();
  }

  const [isProfileCreated, setIsProfileCreated] = useState(false);
  async function checkProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", form.email);
    if (error) {
      console.error("Error fetching users:", error);
    }

    if (data.length === 0) {
      insertUser(form.email);
      navigation.navigate("Questionaire");
    } else if (data) {
      alert(data);
    } else {
    }
  }

  async function validateUserSession() {
    const {
      data: { user, error },
    } = await supabase.auth.getUser();
    if (error) {
      alert(error.message);
    } else if (user == null) {
      alert("invalid authentication");
    } else {
      alert("User is authenticated");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Interests</Text>
      <ScrollView
        contentContainerStyle={styles.tagContainer}
        showsVerticalScrollIndicator={false}
      >
        {availableTags.map((tag) => renderTag(tag))}
      </ScrollView>
      <Text style={styles.selectedTagsText}>
        Your Interests: {selectedTags.join(", ")}
      </Text>

      <View style={styles.formAction}>
        <TouchableOpacity
          onPress={() => {
            {
              //updateProfile();
              signOut();
            }
          }}
        >
          <View style={styles.continue}>
            <Text style={styles.continueText}>Next</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: "10%",
    marginTop: "20%",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tag: {
    backgroundColor: "#ECECEC",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  selectedTag: {
    backgroundColor: "#14999999",
  },
  tagText: {
    fontSize: 16,
  },
  selectedTagText: {
    fontSize: 16,
    color: "white",
    marginBottom: 0,
  },
  selectedTagsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: "10%",
  },
  formAction: {
    flex: 1,
    marginBottom: "20%",
  },

  continue: {
    marginBottom: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#14999999",
    borderColor: "#14999999",
  },
  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
});

export default TagSelectionScreen;
