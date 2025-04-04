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
import { availableTags } from "../auth/profileUtils.js";

const TagSelectionEdit = ({ navigation, route }) => {
  const { session } = route.params;
  const [tagCount, setTagCount] = useState(0);


  const [selectedTags, setSelectedTags] = useState(
    route.params.editedUser.tags
  );

  useEffect(() => {
    setTagCount(selectedTags.length);
  }, [selectedTags]);
  
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

  const userData = {
    tags: selectedTags,
  };

  const handleUpdate = async (userData, session) => {
    setIsError(null);

    if (session?.user) {
      if (userData.tags.length >= 3 && userData.tags.length <= 15) {
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
      } else if (userData.tags.length > 15) {
        setIsError("Choose less than 15 interests");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111111" }}>
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
        {isError && (
          <Animated.Text
            style={[styles.errorText, shakeAnimationStyle]}
            value={isError}
          >
            {isError}
          </Animated.Text>
        )}
        <ScrollView
          contentContainerStyle={styles.tagContainer}
          showsVerticalScrollIndicator={false}
        >
          {availableTags.map((tag) => renderTag(tag))}
        </ScrollView>
        <View style={styles.selectedTagsContainer}>
          <Text style={[styles.selectedTagsText, styles.selectedTagsTextUnderline]}>
            Selected Tags:
          </Text>
          <Text style={styles.selectedTagsText}>
            {selectedTags.join(",  ")}
          </Text>
        </View>
        <Text style={[styles.tagCounter, tagCount > 15 || tagCount < 3 ? styles.tagCounterOverLimit : null]}>
          {tagCount}/15
        </Text>

        

        <StatusBar style="light" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#111111", // 111111
    justifyContent: "center",
    paddingHorizontal: 20,
    
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    marginTop: 10,
    
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",

    //color: "#fff",
  },
  tag: {
    backgroundColor: "#1D1D20",

    borderRadius: 20,

    borderColor: "white",
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
    color: "white",
    fontWeight: 500,
  },
  selectedTagText: {
    fontSize: 16,
    color: "lightgrey",
    marginBottom: 0,
    fontWeight: 500,
  },
  selectedTagsText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
  },
  formAction: {
    flex: 1,
    marginBottom: "20%",
    color: "#111111",
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
    marginBottom: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,

    backgroundColor: "#111111",
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
  tagCounter: {
    position: 'absolute',
    bottom: 0,
    right: 30,
    fontSize: 18,
    color: 'grey',
  },
  tagCounterOverLimit: {
    color: 'red',
  },
  selectedTagsContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 30,
    justifyContent: 'center',
    
  },
  selectedTagsText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  selectedTagsTextUnderline: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',

    marginBottom: 10,
  },
});

export default TagSelectionEdit;
