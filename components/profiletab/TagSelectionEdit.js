import React, { useState, useRef, useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
} from "react-native";

import { supabase } from "../auth/supabase.js";
import { startShakeAnimation } from "../auth/profileUtils.js";

const TagSelectionEdit = ({ navigation, route }) => {
  const { session } = route.params;
  const [selectedTags, setSelectedTags] = useState(
    route.params.editedUser.tags
  );

  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const [isError, setIsError] = useState("");

  const availableTags = [
    "70s", "80s", "90s", "2000s", "Activism", "Adventures", "Animals", "Art", "Baseball", "Basketball", "Beauty", "Board Games", "Books", "Boxing", "Business", "Camping", "Cars", "Coding", "Clubbing", "Cooking", "Country Music", "Craft Beer", "DJ", "Design", "DIY", "Drumming", "Education", "Environmentalism", "Fashion", "Fishing", "Fitness", "Football", "Gaming", "Greek Life", "Guitar", "Health", "Hiking", "History", "Interior Design", "Instagram", "JROTC", "Journalism", "Jiu-Jitsu", "Karoake", "Live Music", "Makeup/Beauty", "Medical/Nursing", "Mixology", "Movies", "Multilingual", "Music", "Nature", "Piano", "Photography", "Politics", "Rap/Hip Hop", "Raves", "Road Trips", "Rock", "Rollerblading", "Running", "Science", "Singing", "Sneakers", "Soccer", "Sports", "Stand-Up Comedy", "Start Ups", "Surfing", "Swimming", "Tattoos", "Technology", "Thrifting", "Travel", "Urban Exploration", "Volunteering", "Writing"
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

  const userData = {
    tags: selectedTags,
  };

  const handleUpdate = async (userData, session) => {
    setIsError(null);

    if (session?.user) {
      if (userData.tags.length >= 3 && userData.tags.length <= 7) {
        const { data, error } = await supabase
          .from("UGC")
          .update({
            tags: userData.tags,
          })
          .eq("user_id", session.user.id);

        if (error) {
          startShakeAnimation();
          setIsError(error.message);
        } else {
          navigation.navigate("EditProfileScreen", {
            updated: true,
            selectedTags,
          });
        }
      } else if (userData.tags.length > 7) {
        setIsError("Less than 7 interests");
        startShakeAnimation(shakeAnimationValue);
      } else if (userData.tags.length < 3) {
        setIsError("At least 3 interests are required");
        startShakeAnimation(shakeAnimationValue);
      }
    }
  };

  const shakeAnimationStyle = {
    transform: [
      {
        translateX: shakeAnimationValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-5, 0, 5],
        }),
      },
    ],
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eBecf4" }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.bbuttonContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.bbutton}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dbuttonContainer}
          onPress={() => {
            {
              handleUpdate(userData, session);
            }
          }}
        >
          <Text style={styles.dbutton}>Done</Text>
        </TouchableOpacity>
      </View>
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

        {isError && (
          <Animated.Text
            style={[styles.errorText, shakeAnimationStyle]}
            value={isError}
          >
            {isError}
          </Animated.Text>
        )}

        <StatusBar style="dark" />
      </View>
    </SafeAreaView>
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
    marginTop: "5%",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    //color: "#fff",
  },
  tag: {
    backgroundColor: "#fff",

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
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,

    //backgroundColor: "transparent",
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
});

export default TagSelectionEdit;
