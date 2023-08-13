import React, { useState, useRef } from "react";
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
import { availableTags } from "../auth/profileUtils.js";
import { supabase } from "../auth/supabase.js";
import { startShakeAnimation } from "../auth/profileUtils.js";

const TagSelectionScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [selectedTags, setSelectedTags] = useState([]);

  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const [isError, setIsError] = useState("");

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

  async function refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    const { session, user } = data;
  }

  const userData = {
    tags: selectedTags,
  };

  const updateProfile = async (userData, session) => {
    if (session?.user) {
      const { data, error } = await supabase
        .from("profile")
        .update({
          tags: userData.tags,
        })
        .eq("user_id", session.user.id);

      if (error) {
        alert("Error updating profile:", error.message);
      }
    }
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
        const { data: profileData, profileError } = await supabase
          .from("profile")
          .update({
            profile_complete: true,
          })
          .eq("user_id", session.user.id);

        if (error) {
          startShakeAnimation();
          setIsError(error.message);
        } else {
          refreshSession();

          //signOut();
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

        <View style={styles.formAction}>
          <TouchableOpacity
            onPress={() => {
              {
                handleUpdate(userData, session);
              }
            }}
          >
            <View style={styles.continue}>
              <Text style={styles.continueText}>Next</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    marginBottom: 10,
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
    marginTop: "10%",
  },
  formAction: {
    marginBottom: 20,
  },

  continue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
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
});

export default TagSelectionScreen;
