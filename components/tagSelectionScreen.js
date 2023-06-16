import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { supabase } from "./auth/supabase.js";

const TagSelectionScreen = () => {
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
              updateProfile();
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
    marginBottom: 20,
    marginTop: 20,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
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
    marginBottom: "25%",
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
    backgroundColor: "#075eec",
    borderColor: "#075eec",
  },
  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
});

export default TagSelectionScreen;
